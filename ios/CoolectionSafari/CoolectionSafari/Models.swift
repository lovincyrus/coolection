import Foundation

struct Item: Codable, Identifiable {
    let id: String
    let url: String?
    let title: String
    let description: String?
    let image: String?
    let type: String?
    let createdAt: String

    var domain: String? {
        guard let url, let host = URL(string: url)?.host else { return nil }
        return host.hasPrefix("www.") ? String(host.dropFirst(4)) : host
    }

    var relativeDate: String {
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = fmt.date(from: createdAt) else { return "" }
        let rel = RelativeDateTimeFormatter()
        rel.unitsStyle = .abbreviated
        return rel.localizedString(for: date, relativeTo: Date())
    }

    var typeIcon: String {
        switch type {
        case "tweet": return "at"
        case "github_star": return "star.fill"
        default: return "globe"
        }
    }
}

struct ItemList: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let source: String?
}
