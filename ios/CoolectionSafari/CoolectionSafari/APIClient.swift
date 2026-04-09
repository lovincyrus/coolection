import Foundation

final class APIClient {
    let serverURL: String
    let token: String

    init(serverURL: String, token: String) {
        self.serverURL = serverURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        self.token = token
    }

    private func request(_ path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> Data {
        guard let url = URL(string: "\(serverURL)\(path)") else {
            throw APIError.invalidURL
        }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.server(http.statusCode)
        }
        return data
    }

    func fetchItems(page: Int = 1, limit: Int = 20) async throws -> [Item] {
        let data = try await request("/api/items?page=\(page)&limit=\(limit)")
        return try JSONDecoder().decode([Item].self, from: data)
    }

    func fetchLists() async throws -> [ItemList] {
        let data = try await request("/api/lists")
        return try JSONDecoder().decode([ItemList].self, from: data)
    }

    func fetchListItems(listId: String) async throws -> [Item] {
        let data = try await request("/api/lists/\(listId)/items")
        return try JSONDecoder().decode([Item].self, from: data)
    }

    func search(query: String) async throws -> [Item] {
        let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        let data = try await request("/api/search?q=\(encoded)")
        return try JSONDecoder().decode([Item].self, from: data)
    }

    func createItem(url: String) async throws {
        _ = try await request("/api/item/create", method: "POST", body: ["url": url])
    }

    func archiveItem(id: String) async throws {
        _ = try await request("/api/item/archive", method: "PUT", body: ["item_id": id])
    }

    func addItemToList(itemId: String, listId: String) async throws {
        _ = try await request("/api/list/add", method: "POST", body: ["item_id": itemId, "list_id": listId])
    }

    func renameList(listId: String, name: String) async throws {
        _ = try await request("/api/list/edit", method: "PATCH", body: ["list_id": listId, "name": name])
    }

    func editItem(id: String, title: String, description: String?) async throws {
        var body: [String: Any] = ["item_id": id, "title": title]
        if let description { body["description"] = description }
        _ = try await request("/api/item/edit", method: "PATCH", body: body)
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case server(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response"
        case .unauthorized: return "Invalid token"
        case .server(let code): return "Server error (\(code))"
        }
    }
}
