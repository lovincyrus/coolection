import Foundation

enum DemoData {
    static let allItemsListId = "demo-list-all"
    static let designListId = "demo-list-design"
    static let readingListId = "demo-list-reading"
    static let toolsListId = "demo-list-tools"

    static let lists: [ItemList] = [
        ItemList(
            id: designListId,
            name: "Design Inspiration",
            description: "Beautiful interfaces and product details worth studying.",
            source: nil
        ),
        ItemList(
            id: readingListId,
            name: "Read Later",
            description: "Long-form articles to come back to.",
            source: nil
        ),
        ItemList(
            id: toolsListId,
            name: "Tools & Apps",
            description: "Software I want to try.",
            source: nil
        ),
    ]

    static let items: [Item] = [
        Item(
            id: "demo-item-01",
            url: "https://www.apple.com/newsroom/",
            title: "Apple Newsroom — Product announcements and press releases",
            description: "Official announcements from Apple. A great example of clear product communication and visual hierarchy.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 1)
        ),
        Item(
            id: "demo-item-02",
            url: "https://www.swift.org/blog/",
            title: "Swift.org Blog",
            description: "Updates from the Swift open source project — new language features, evolution proposals, and tooling.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 2)
        ),
        Item(
            id: "demo-item-03",
            url: "https://news.ycombinator.com/",
            title: "Hacker News",
            description: "Tech news, startup discussions, and engineering deep-dives.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 3)
        ),
        Item(
            id: "demo-item-04",
            url: "https://www.figma.com/blog/",
            title: "Figma Blog — Design and product updates",
            description: "Articles on design systems, multiplayer design, and FigJam.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 4)
        ),
        Item(
            id: "demo-item-05",
            url: "https://github.com/apple/swift",
            title: "apple/swift on GitHub",
            description: "The Swift Programming Language source repository.",
            image: nil,
            type: "github_star",
            createdAt: relativeDate(daysAgo: 5)
        ),
        Item(
            id: "demo-item-06",
            url: "https://linear.app/blog",
            title: "Linear Blog — Behind the product and team",
            description: "Posts on building Linear, product principles, and the company's engineering and design culture.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 7)
        ),
        Item(
            id: "demo-item-07",
            url: "https://ramp.com/labs",
            title: "Ramp Labs — Engineering and product writing",
            description: "Ramp's builders blog on shipping fast, AI-native finance tooling, and engineering culture.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 9)
        ),
        Item(
            id: "demo-item-08",
            url: "https://www.linear.app/method",
            title: "The Linear Method",
            description: "Linear's principles for building software product teams.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 11)
        ),
        Item(
            id: "demo-item-09",
            url: "https://www.youtube.com/@WWDC",
            title: "WWDC on YouTube",
            description: "Sessions from Apple's Worldwide Developers Conference.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 14)
        ),
        Item(
            id: "demo-item-10",
            url: "https://overreacted.io/",
            title: "Overreacted — Dan Abramov's blog",
            description: "Notes on React, JavaScript, and the craft of programming.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 18)
        ),
        Item(
            id: "demo-item-11",
            url: "https://daringfireball.net/",
            title: "Daring Fireball",
            description: "John Gruber's long-running blog on Apple, technology, and design.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 22)
        ),
        Item(
            id: "demo-item-12",
            url: "https://stripe.com/blog/engineering",
            title: "Stripe Engineering Blog",
            description: "How Stripe builds reliable financial infrastructure at scale.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 28)
        ),
        Item(
            id: "demo-item-13",
            url: "https://cursor.com/blog",
            title: "Cursor Blog — The AI code editor",
            description: "Posts from the Cursor team on AI coding, model evaluation, and editor design.",
            image: nil,
            type: "link",
            createdAt: relativeDate(daysAgo: 6)
        ),
    ]

    static let listMembership: [String: [String]] = [
        designListId: ["demo-item-01", "demo-item-04", "demo-item-08"],
        readingListId: ["demo-item-03", "demo-item-06", "demo-item-07", "demo-item-10", "demo-item-11", "demo-item-12", "demo-item-13"],
        toolsListId: ["demo-item-13"],
    ]

    static func items(in listId: String) -> [Item] {
        guard let ids = listMembership[listId] else { return [] }
        let lookup = Dictionary(uniqueKeysWithValues: items.map { ($0.id, $0) })
        return ids.compactMap { lookup[$0] }
    }

    static func search(query: String) -> [Item] {
        let needle = query.lowercased()
        return items.filter { item in
            if item.title.lowercased().contains(needle) { return true }
            if let desc = item.description?.lowercased(), desc.contains(needle) { return true }
            if let url = item.url?.lowercased(), url.contains(needle) { return true }
            return false
        }
    }

    private static func relativeDate(daysAgo: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return fmt.string(from: date)
    }
}
