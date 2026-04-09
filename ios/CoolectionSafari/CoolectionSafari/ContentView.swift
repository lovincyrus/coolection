import Combine
import SwiftUI

// MARK: - App State

final class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var serverURL: String = ""
    @Published var token: String = ""

    init() {
        token = KeychainHelper.read() ?? ""
        serverURL = AppConstants.defaults?.string(forKey: "serverURL") ?? AppConstants.defaultServer
        isAuthenticated = !token.isEmpty
    }

    var api: APIClient { APIClient(serverURL: serverURL, token: token) }

    func signIn(server: String, token: String) {
        let trimmed = server.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        serverURL = trimmed
        self.token = token
        AppConstants.defaults?.set(trimmed, forKey: "serverURL")
        _ = KeychainHelper.save(token: token)
        isAuthenticated = true
    }

    func signOut() {
        KeychainHelper.delete()
        token = ""
        isAuthenticated = false
    }
}

// MARK: - Root

struct ContentView: View {
    @StateObject private var appState = AppState()

    var body: some View {
        if appState.isAuthenticated {
            MainTabView().environmentObject(appState)
        } else {
            AuthView().environmentObject(appState)
        }
    }
}

// MARK: - Auth

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var server: String = ""
    @State private var token: String = ""
    @State private var isConnecting = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    Spacer().frame(height: 40)

                    // Logo
                    VStack(spacing: 8) {
                        Image("LargeIcon")
                            .resizable()
                            .frame(width: 48, height: 48)
                            .cornerRadius(12)
                        Text("Coolection")
                            .font(.title2.weight(.semibold))
                    }

                    // Form
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Server").font(.subheadline.weight(.medium))
                                .foregroundStyle(.secondary)
                            TextField("https://coolection.co", text: $server)
                                .textContentType(.URL)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                                .padding(12)
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("API Token").font(.subheadline.weight(.medium))
                                .foregroundStyle(.secondary)
                            SecureField("coolection_...", text: $token)
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                                .padding(12)
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(8)
                        }

                        if let error {
                            Text(error)
                                .font(.footnote)
                                .foregroundStyle(.red)
                        }

                        Button {
                            connect()
                        } label: {
                            Group {
                                if isConnecting {
                                    ProgressView()
                                } else {
                                    Text("Connect")
                                        .font(.body.weight(.medium))
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(canConnect ? Color.primary : Color.secondary.opacity(0.3))
                            .foregroundStyle(Color(.systemBackground))
                            .cornerRadius(8)
                        }
                        .disabled(!canConnect || isConnecting)
                    }
                    .padding(20)
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.05), radius: 8, y: 2)

                    Text("Generate a token at your server's /settings page.")
                        .font(.footnote)
                        .foregroundStyle(.tertiary)
                }
                .padding(.horizontal, 24)
            }
            .background(Color(.secondarySystemBackground))
        }
        .onAppear {
            server = AppConstants.defaults?.string(forKey: "serverURL") ?? AppConstants.defaultServer
        }
    }

    private var canConnect: Bool {
        token.hasPrefix("coolection_") && !server.isEmpty
    }

    private func connect() {
        error = nil
        isConnecting = true
        let s = server.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let t = token
        let client = APIClient(serverURL: s, token: t)

        Task {
            do {
                _ = try await client.fetchItems(page: 1, limit: 1)
                await MainActor.run {
                    appState.signIn(server: s, token: t)
                }
            } catch let err as APIError where err == .unauthorized {
                await MainActor.run { error = "Invalid token"; isConnecting = false }
            } catch {
                await MainActor.run { self.error = error.localizedDescription; isConnecting = false }
            }
        }
    }
}

extension APIError: Equatable {
    static func == (lhs: APIError, rhs: APIError) -> Bool {
        switch (lhs, rhs) {
        case (.invalidURL, .invalidURL),
             (.invalidResponse, .invalidResponse),
             (.unauthorized, .unauthorized): return true
        case (.server(let a), .server(let b)): return a == b
        default: return false
        }
    }
}

// MARK: - Main Tab

struct MainTabView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView {
            ItemsTab()
                .tabItem { Label("Items", systemImage: "square.stack") }
            ListsTab()
                .tabItem { Label("Lists", systemImage: "folder") }
            SearchTab()
                .tabItem { Label("Search", systemImage: "magnifyingglass") }
            SettingsTab()
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(.primary)
    }
}

// MARK: - Items Tab

struct ItemsTab: View {
    @EnvironmentObject var appState: AppState
    @State private var items: [Item] = []
    @State private var page = 1
    @State private var isLoading = false
    @State private var hasMore = true
    @State private var didLoadCache = false
    @State private var showAddSheet = false
    @State private var itemToAddToList: Item?
    @State private var itemToEdit: Item?

    private let cache = DiskCache<[Item]>(key: "items_page1")

    var body: some View {
        NavigationStack {
            List {
                ForEach(items) { item in
                    ItemRow(item: item)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) { archive(item) } label: {
                                Label("Archive", systemImage: "archivebox")
                            }
                        }
                        .swipeActions(edge: .leading) {
                            Button { itemToAddToList = item } label: {
                                Label("Add to List", systemImage: "folder.badge.plus")
                            }
                            .tint(.blue)
                        }
                        .contextMenu {
                            Button { itemToEdit = item } label: {
                                Label("Edit", systemImage: "pencil")
                            }
                            Button { itemToAddToList = item } label: {
                                Label("Add to List", systemImage: "folder.badge.plus")
                            }
                            Button(role: .destructive) { archive(item) } label: {
                                Label("Archive", systemImage: "archivebox")
                            }
                        }
                }

                if hasMore && !items.isEmpty {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                    .onAppear { loadMore() }
                }
            }
            .listStyle(.plain)
            .refreshable { await revalidate() }
            .overlay {
                if didLoadCache && items.isEmpty {
                    ContentUnavailableView(
                        "No items yet",
                        systemImage: "square.stack",
                        description: Text("Save your first link to get started.")
                    )
                }
            }
            .navigationTitle("Items")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showAddSheet = true } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddItemSheet {
                    cache.clear()
                    await revalidate()
                }
            }
            .sheet(item: $itemToAddToList) { item in
                ListPickerSheet(item: item)
            }
            .sheet(item: $itemToEdit) { item in
                EditItemSheet(item: item) { updated in
                    if let idx = items.firstIndex(where: { $0.id == updated.id }) {
                        items[idx] = updated
                        cache.write(items)
                    }
                }
            }
        }
        .task {
            if let cached = cache.read() {
                items = cached
                hasMore = cached.count >= 20
            }
            didLoadCache = true
            await revalidate()
        }
    }

    private func revalidate() async {
        isLoading = true
        page = 1
        if let fetched = try? await appState.api.fetchItems(page: 1) {
            items = fetched
            hasMore = fetched.count >= 20
            cache.write(fetched)
        }
        isLoading = false
    }

    private func loadMore() {
        guard !isLoading, hasMore else { return }
        isLoading = true
        let nextPage = page + 1
        Task {
            if let fetched = try? await appState.api.fetchItems(page: nextPage) {
                await MainActor.run {
                    items.append(contentsOf: fetched)
                    page = nextPage
                    hasMore = fetched.count >= 20
                    isLoading = false
                }
            }
        }
    }

    private func archive(_ item: Item) {
        items.removeAll { $0.id == item.id }
        cache.write(items)
        Task {
            try? await appState.api.archiveItem(id: item.id)
        }
    }
}

// MARK: - Search Tab

struct SearchTab: View {
    @EnvironmentObject var appState: AppState
    @State private var searchText = ""
    @State private var results: [Item] = []
    @State private var searchTask: Task<Void, Never>?
    @State private var itemToEdit: Item?
    @State private var itemToAddToList: Item?

    var body: some View {
        NavigationStack {
            List {
                ForEach(results) { item in
                    ItemRow(item: item)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                        .swipeActions(edge: .leading) {
                            Button { itemToAddToList = item } label: {
                                Label("Add to List", systemImage: "folder.badge.plus")
                            }
                            .tint(.blue)
                        }
                        .contextMenu {
                            Button { itemToEdit = item } label: {
                                Label("Edit", systemImage: "pencil")
                            }
                            Button { itemToAddToList = item } label: {
                                Label("Add to List", systemImage: "folder.badge.plus")
                            }
                        }
                }
            }
            .listStyle(.plain)
            .searchable(text: $searchText, prompt: "Search items")
            .onChange(of: searchText) { newValue in
                searchTask?.cancel()
                guard !newValue.isEmpty else { results = []; return }
                searchTask = Task {
                    try? await Task.sleep(nanoseconds: 300_000_000)
                    guard !Task.isCancelled else { return }
                    if let fetched = try? await appState.api.search(query: newValue) {
                        await MainActor.run { results = fetched }
                    }
                }
            }
            .overlay {
                if results.isEmpty {
                    ContentUnavailableView(
                        searchText.isEmpty ? "Search" : "No results",
                        systemImage: "magnifyingglass",
                        description: Text(searchText.isEmpty ? "Search your saved items." : "Try a different search.")
                    )
                }
            }
            .navigationTitle("Search")
            .sheet(item: $itemToEdit) { item in
                EditItemSheet(item: item) { updated in
                    if let idx = results.firstIndex(where: { $0.id == updated.id }) {
                        results[idx] = updated
                    }
                }
            }
            .sheet(item: $itemToAddToList) { item in
                ListPickerSheet(item: item)
            }
        }
    }
}

// MARK: - Item Row

struct ItemRow: View {
    let item: Item

    var body: some View {
        Button {
            if let url = item.url, let link = URL(string: url) {
                UIApplication.shared.open(link)
            }
        } label: {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)
                        .lineLimit(2)

                    if let desc = item.description, !desc.isEmpty {
                        Text(desc)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }

                    HStack(spacing: 6) {
                        Image(systemName: item.typeIcon)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                        if let domain = item.domain {
                            Text(domain)
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Text("·")
                            .foregroundStyle(.quaternary)
                        Text(item.relativeDate)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }

                Spacer(minLength: 0)

                if let image = item.image, let url = URL(string: image) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let img):
                            img.resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 52, height: 52)
                                .cornerRadius(6)
                                .clipped()
                        default:
                            EmptyView()
                        }
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Add Item Sheet

struct AddItemSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var url = ""
    @State private var isSaving = false
    @State private var error: String?
    @State private var hasClipboardURL = false
    @FocusState private var isFieldFocused: Bool
    var onSaved: () async -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                TextField("https://", text: $url)
                    .textContentType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.URL)
                    .focused($isFieldFocused)
                    .submitLabel(.go)
                    .onSubmit { if canSave { save() } }
                    .padding(12)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(8)

                if hasClipboardURL && url.isEmpty {
                    PasteButton(payloadType: URL.self) { urls in
                        if let pasted = urls.first {
                            url = pasted.absoluteString
                            hasClipboardURL = false
                        }
                    }
                    .buttonBorderShape(.roundedRectangle(radius: 8))
                    .labelStyle(.titleAndIcon)
                }

                if let error {
                    Text(error).font(.footnote).foregroundStyle(.red)
                }

                Spacer()
            }
            .padding(20)
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Button("Add") { save() }
                            .disabled(!canSave)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .onAppear {
            isFieldFocused = true
            detectClipboard()
        }
    }

    private var canSave: Bool {
        !url.isEmpty && !isSaving
    }

    private func detectClipboard() {
        hasClipboardURL = UIPasteboard.general.hasURLs
    }

    private func save() {
        isSaving = true
        error = nil
        Task {
            do {
                try await appState.api.createItem(url: url)
                await onSaved()
                await MainActor.run { dismiss() }
            } catch {
                await MainActor.run { self.error = error.localizedDescription; isSaving = false }
            }
        }
    }
}

// MARK: - Edit Item Sheet

struct EditItemSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let item: Item
    var onSaved: (Item) -> Void

    @State private var title: String = ""
    @State private var desc: String = ""
    @State private var isSaving = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Title") {
                    TextField("Title", text: $title)
                }
                Section("Description") {
                    TextField("Description", text: $desc, axis: .vertical)
                        .lineLimit(3...6)
                }
                if let error {
                    Section {
                        Text(error).foregroundColor(.red).font(.footnote)
                    }
                }
            }
            .navigationTitle("Edit Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Button("Save") { save() }
                            .disabled(title.isEmpty || !hasChanges)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .onAppear {
            title = item.title
            desc = item.description ?? ""
        }
    }

    private var hasChanges: Bool {
        title != item.title || desc != (item.description ?? "")
    }

    private func save() {
        isSaving = true
        error = nil
        let newTitle = title
        let newDesc = desc.isEmpty ? nil : desc
        Task {
            do {
                try await appState.api.editItem(id: item.id, title: newTitle, description: newDesc)
                let updated = Item(id: item.id, url: item.url, title: newTitle, description: newDesc, image: item.image, type: item.type, createdAt: item.createdAt)
                await MainActor.run {
                    onSaved(updated)
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    self.error = error.localizedDescription
                    isSaving = false
                }
            }
        }
    }
}

// MARK: - List Picker

struct ListPickerSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let item: Item
    @State private var lists: [ItemList] = []
    @State private var isLoading = true
    @State private var addedListId: String?
    @State private var error: String?
    @State private var searchText = ""

    private let listsCache = DiskCache<[ItemList]>(key: "lists")
    private var userLists: [ItemList] { lists.filter { $0.source == nil } }
    private var filteredLists: [ItemList] {
        guard !searchText.isEmpty else { return userLists }
        return userLists.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredLists) { list in
                    listRow(list)
                        .listRowSeparator(.hidden)
                }
            }
            .listStyle(.plain)
            .searchable(text: $searchText, prompt: "Search lists")
            .overlay {
                if !isLoading && filteredLists.isEmpty {
                    ContentUnavailableView(
                        searchText.isEmpty ? "No lists" : "No results",
                        systemImage: searchText.isEmpty ? "folder" : "magnifyingglass",
                        description: Text(searchText.isEmpty ? "Create a list to get started." : "Try a different search."))
                }
            }
            .safeAreaInset(edge: .bottom) {
                if let error {
                    Text(error)
                        .font(.footnote)
                        .foregroundColor(addedListId != nil ? .secondary : .red)
                        .padding()
                        .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Add to List")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .task {
            if let cached = listsCache.read() {
                lists = cached
            }
            isLoading = false
            if let fetched = try? await appState.api.fetchLists() {
                lists = fetched
                listsCache.write(fetched)
            }
        }
    }

    private func listRow(_ list: ItemList) -> some View {
        Button { addToList(list) } label: {
            HStack(spacing: 10) {
                Image(systemName: "folder")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(width: 24)
                Text(list.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
                Spacer()
                if addedListId == list.id {
                    Image(systemName: "checkmark")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.green)
                }
            }
            .padding(.vertical, 4)
        }
        .disabled(addedListId != nil)
    }

    private func addToList(_ list: ItemList) {
        error = nil
        Task {
            do {
                try await appState.api.addItemToList(itemId: item.id, listId: list.id)
                await MainActor.run { addedListId = list.id }
                try? await Task.sleep(nanoseconds: 600_000_000)
                await MainActor.run { dismiss() }
            } catch let err as APIError {
                await MainActor.run {
                    switch err {
                    case .server(400):
                        addedListId = list.id
                        error = "Already in this list"
                    default:
                        error = err.localizedDescription
                    }
                }
                if case .server(400) = err {
                    try? await Task.sleep(nanoseconds: 800_000_000)
                    await MainActor.run { dismiss() }
                }
            } catch {
                await MainActor.run { self.error = error.localizedDescription }
            }
        }
    }
}

// MARK: - Lists Tab

struct ListsTab: View {
    @EnvironmentObject var appState: AppState
    @State private var lists: [ItemList] = []
    @State private var didLoadCache = false
    @State private var listToRename: ItemList?
    @State private var renameText = ""
    @State private var showCreateAlert = false
    @State private var newListName = ""

    private let cache = DiskCache<[ItemList]>(key: "lists")

    var body: some View {
        NavigationStack {
            List {
                ForEach(lists) { list in
                    NavigationLink {
                        ListDetailView(list: list)
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: list.source != nil ? "tray.fill" : "folder")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(list.name)
                                    .font(.subheadline.weight(.medium))
                                if let desc = list.description, !desc.isEmpty {
                                    Text(desc)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(1)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .listRowSeparator(.hidden)
                    .contextMenu {
                        if list.source == nil {
                            Button {
                                renameText = list.name
                                listToRename = list
                            } label: {
                                Label("Rename", systemImage: "pencil")
                            }
                        }
                    }
                }
            }
            .listStyle(.plain)
            .refreshable { await revalidate() }
            .overlay {
                if didLoadCache && lists.isEmpty {
                    ContentUnavailableView("No lists", systemImage: "folder",
                        description: Text("Lists you create will appear here."))
                }
            }
            .navigationTitle("Lists")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        newListName = ""
                        showCreateAlert = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .alert("New List", isPresented: $showCreateAlert) {
                TextField("Name", text: $newListName)
                Button("Create") { createList() }
                Button("Cancel", role: .cancel) {}
            }
            .alert("Rename List", isPresented: .init(
                get: { listToRename != nil },
                set: { if !$0 { listToRename = nil } }
            )) {
                TextField("Name", text: $renameText)
                Button("Rename") { rename() }
                Button("Cancel", role: .cancel) { listToRename = nil }
            }
        }
        .task {
            if let cached = cache.read() {
                lists = cached
            }
            didLoadCache = true
            await revalidate()
        }
    }

    private func revalidate() async {
        if let fetched = try? await appState.api.fetchLists() {
            lists = fetched
            cache.write(fetched)
        }
    }

    private func createList() {
        guard !newListName.isEmpty else { return }
        Task {
            try? await appState.api.createList(name: newListName)
            cache.clear()
            await revalidate()
        }
    }

    private func rename() {
        guard let list = listToRename, !renameText.isEmpty else { return }
        let newName = renameText
        if let idx = lists.firstIndex(where: { $0.id == list.id }) {
            lists[idx] = ItemList(id: list.id, name: newName, description: list.description, source: list.source)
            cache.write(lists)
        }
        Task {
            try? await appState.api.renameList(listId: list.id, name: newName)
            await revalidate()
        }
        listToRename = nil
    }
}

// MARK: - List Detail

struct ListDetailView: View {
    @EnvironmentObject var appState: AppState
    let list: ItemList
    @State private var items: [Item] = []
    @State private var isLoading = false
    @State private var didLoadCache = false
    @State private var itemToEdit: Item?
    @State private var itemToAddToList: Item?

    private var cache: DiskCache<[Item]> { DiskCache<[Item]>(key: "list_\(list.id)") }

    var body: some View {
        List {
            ForEach(items) { item in
                ItemRow(item: item)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowSeparator(.hidden)
                    .swipeActions(edge: .leading) {
                        Button { itemToAddToList = item } label: {
                            Label("Add to List", systemImage: "folder.badge.plus")
                        }
                        .tint(.blue)
                    }
                    .contextMenu {
                        Button { itemToEdit = item } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        Button { itemToAddToList = item } label: {
                            Label("Add to List", systemImage: "folder.badge.plus")
                        }
                    }
            }
        }
        .listStyle(.plain)
        .refreshable { await revalidate() }
        .overlay {
            if didLoadCache && items.isEmpty {
                ContentUnavailableView("Empty list", systemImage: "folder",
                    description: Text("No items in this list yet."))
            }
        }
        .navigationTitle(list.name)
        .sheet(item: $itemToEdit) { item in
            EditItemSheet(item: item) { updated in
                if let idx = items.firstIndex(where: { $0.id == updated.id }) {
                    items[idx] = updated
                    cache.write(items)
                }
            }
        }
        .sheet(item: $itemToAddToList) { item in
            ListPickerSheet(item: item)
        }
        .task {
            if let cached = cache.read() {
                items = cached
            }
            didLoadCache = true
            await revalidate()
        }
    }

    private func revalidate() async {
        isLoading = true
        if let fetched = try? await appState.api.fetchListItems(listId: list.id) {
            items = fetched
            cache.write(fetched)
        }
        isLoading = false
    }
}

// MARK: - Settings Tab

struct SettingsTab: View {
    @EnvironmentObject var appState: AppState
    @State private var server = ""
    @State private var token = ""
    @State private var isSaving = false
    @State private var showSignOutConfirm = false
    @State private var statusMessage: String?
    @State private var statusIsError = false

    var body: some View {
        NavigationStack {
            Form {
                connectionSection
                signOutSection
            }
            .navigationTitle("Settings")
            .alert("Sign Out?", isPresented: $showSignOutConfirm) {
                Button("Sign Out", role: .destructive) { appState.signOut() }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("You'll need to re-enter your token to reconnect.")
            }
        }
        .onAppear {
            server = appState.serverURL
            token = appState.token
        }
    }

    private var connectionSection: some View {
        Section {
            LabeledContent("Server") {
                TextField("https://coolection.co", text: $server)
                    .textContentType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.URL)
                    .multilineTextAlignment(.trailing)
            }
            LabeledContent("Token") {
                SecureField("coolection_...", text: $token)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .multilineTextAlignment(.trailing)
            }
            Button {
                saveSettings()
            } label: {
                HStack {
                    Spacer()
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save Changes")
                    }
                    Spacer()
                }
            }
            .disabled(!hasChanges || isSaving)
        } header: {
            Text("Connection")
        } footer: {
            if let statusMessage {
                Text(statusMessage)
                    .foregroundColor(statusIsError ? .red : .green)
            } else {
                Text("Generate a token at your server's /settings page.")
            }
        }
    }

    private var signOutSection: some View {
        Section {
            Button(role: .destructive) {
                showSignOutConfirm = true
            } label: {
                HStack {
                    Spacer()
                    Text("Sign Out")
                    Spacer()
                }
            }
        }
    }

    private var hasChanges: Bool {
        server != appState.serverURL || token != appState.token
    }

    private func saveSettings() {
        isSaving = true
        statusMessage = nil
        statusIsError = false
        let s = server.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let t = token
        let client = APIClient(serverURL: s, token: t)

        Task {
            do {
                _ = try await client.fetchItems(page: 1, limit: 1)
                await MainActor.run {
                    appState.signIn(server: s, token: t)
                    DiskCache<[Item]>(key: "items_page1").clear()
                    DiskCache<[ItemList]>(key: "lists").clear()
                    statusMessage = "Connected"
                    statusIsError = false
                    isSaving = false
                }
            } catch let err as APIError where err == .unauthorized {
                await MainActor.run {
                    statusMessage = "Invalid token"
                    statusIsError = true
                    isSaving = false
                }
            } catch {
                await MainActor.run {
                    statusMessage = error.localizedDescription
                    statusIsError = true
                    isSaving = false
                }
            }
        }
    }
}
