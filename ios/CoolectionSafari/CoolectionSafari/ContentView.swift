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
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            ItemsTab()
                .tabItem { Label("Items", systemImage: "square.stack") }
                .tag(0)
            ListsTab()
                .tabItem { Label("Lists", systemImage: "folder") }
                .tag(1)
            SettingsTab()
                .tabItem { Label("Settings", systemImage: "gearshape") }
                .tag(2)
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
    @State private var searchText = ""
    @State private var searchResults: [Item] = []
    @State private var searchTask: Task<Void, Never>?
    @State private var showAddSheet = false
    @State private var didLoadCache = false

    private let cache = DiskCache<[Item]>(key: "items_page1")
    private var displayItems: [Item] { searchText.isEmpty ? items : searchResults }

    var body: some View {
        NavigationStack {
            List {
                ForEach(displayItems) { item in
                    ItemRow(item: item)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) { archive(item) } label: {
                                Label("Archive", systemImage: "archivebox")
                            }
                        }
                }

                if searchText.isEmpty && hasMore && !items.isEmpty {
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
            .searchable(text: $searchText, prompt: "Search items")
            .onChange(of: searchText) { newValue in
                searchTask?.cancel()
                guard !newValue.isEmpty else { searchResults = []; return }
                searchTask = Task {
                    try? await Task.sleep(nanoseconds: 300_000_000)
                    guard !Task.isCancelled else { return }
                    if let results = try? await appState.api.search(query: newValue) {
                        await MainActor.run { searchResults = results }
                    }
                }
            }
            .refreshable { await revalidate() }
            .overlay {
                if didLoadCache && displayItems.isEmpty {
                    ContentUnavailableView(
                        searchText.isEmpty ? "No items yet" : "No results",
                        systemImage: searchText.isEmpty ? "square.stack" : "magnifyingglass",
                        description: Text(searchText.isEmpty ? "Save your first link to get started." : "Try a different search.")
                    )
                }
            }
            .navigationTitle("Items")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
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
        }
        .task {
            // SWR: show stale cache immediately, then revalidate
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
    var onSaved: () async -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                TextField("https://", text: $url)
                    .textContentType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(12)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(8)

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
                    Button("Save") { save() }
                        .disabled(url.isEmpty || isSaving)
                }
            }
        }
        .presentationDetents([.medium])
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

// MARK: - Lists Tab

struct ListsTab: View {
    @EnvironmentObject var appState: AppState
    @State private var lists: [ItemList] = []
    @State private var didLoadCache = false

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
}

// MARK: - List Detail

struct ListDetailView: View {
    @EnvironmentObject var appState: AppState
    let list: ItemList
    @State private var items: [Item] = []
    @State private var isLoading = false

    var body: some View {
        List {
            ForEach(items) { item in
                ItemRow(item: item)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowSeparator(.hidden)
            }
        }
        .listStyle(.plain)
        .refreshable { await refresh() }
        .overlay {
            if !isLoading && items.isEmpty {
                ContentUnavailableView("Empty list", systemImage: "folder",
                    description: Text("No items in this list yet."))
            }
        }
        .navigationTitle(list.name)
        .task { await refresh() }
    }

    private func refresh() async {
        isLoading = true
        if let fetched = try? await appState.api.fetchListItems(listId: list.id) {
            items = fetched
        }
        isLoading = false
    }
}

// MARK: - Settings Tab

struct SettingsTab: View {
    @EnvironmentObject var appState: AppState
    @State private var showSignOutConfirm = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Text("Server")
                        Spacer()
                        Text(appState.serverURL)
                            .font(.footnote.monospaced())
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    HStack {
                        Text("Token")
                        Spacer()
                        Text("coolection_•••")
                            .font(.footnote.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }

                Section {
                    Button(role: .destructive) {
                        showSignOutConfirm = true
                    } label: {
                        Text("Sign Out")
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Sign Out?", isPresented: $showSignOutConfirm) {
                Button("Sign Out", role: .destructive) { appState.signOut() }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("You'll need to re-enter your token to reconnect.")
            }
        }
    }
}
