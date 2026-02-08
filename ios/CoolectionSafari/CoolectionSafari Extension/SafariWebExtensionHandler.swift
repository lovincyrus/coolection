import SafariServices

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private static let defaults = AppConstants.defaults
    private static let defaultServer = AppConstants.defaultServer

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem
        let message = request?.userInfo?[SFExtensionMessageKey] as? [String: Any]

        guard let action = message?["action"] as? String else {
            context.completeRequest(returningItems: nil)
            return
        }

        if action == "getToken" {
            let response = NSExtensionItem()
            let serverURL = Self.defaults?.string(forKey: "serverURL") ?? Self.defaultServer

            if let token = KeychainHelper.read() {
                response.userInfo = [SFExtensionMessageKey: [
                    "token": token,
                    "serverURL": serverURL,
                ]]
            } else {
                response.userInfo = [SFExtensionMessageKey: ["error": "no_token"]]
            }

            context.completeRequest(returningItems: [response])
        } else {
            context.completeRequest(returningItems: nil)
        }
    }
}
