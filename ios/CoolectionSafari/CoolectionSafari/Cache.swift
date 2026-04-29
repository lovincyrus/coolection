import Foundation

private let _memoryCache: NSCache<NSString, AnyObject> = {
    let c = NSCache<NSString, AnyObject>()
    c.countLimit = 50
    return c
}()

struct DiskCache<T: Codable> {
    private let key: String

    init(key: String) {
        self.key = key
    }

    func read() -> T? {
        if let box = _memoryCache.object(forKey: key as NSString) as? Box,
           let value = box.value as? T {
            return value
        }
        guard let data = try? Data(contentsOf: fileURL),
              let decoded = try? JSONDecoder().decode(T.self, from: data) else {
            return nil
        }
        _memoryCache.setObject(Box(decoded), forKey: key as NSString)
        return decoded
    }

    func write(_ value: T) {
        _memoryCache.setObject(Box(value), forKey: key as NSString)
        let url = fileURL
        Task.detached(priority: .utility) {
            guard let data = try? JSONEncoder().encode(value) else { return }
            try? data.write(to: url, options: .atomic)
        }
    }

    func clear() {
        _memoryCache.removeObject(forKey: key as NSString)
        try? FileManager.default.removeItem(at: fileURL)
    }

    private var fileURL: URL {
        let dir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("coolection", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("\(key).json")
    }
}

private final class Box: NSObject {
    let value: Any
    init(_ value: Any) { self.value = value }
}
