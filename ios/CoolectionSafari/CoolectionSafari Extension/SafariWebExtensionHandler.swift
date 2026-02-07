import SafariServices

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem
        let message = request?.userInfo?[SFExtensionMessageKey] as? [String: Any]

        guard let action = message?["action"] as? String else {
            context.completeRequest(returningItems: nil)
            return
        }

        if action == "getToken" {
            let response = NSExtensionItem()

            if let token = KeychainHelper.read() {
                response.userInfo = [SFExtensionMessageKey: ["token": token]]
            } else {
                response.userInfo = [SFExtensionMessageKey: ["error": "no_token"]]
            }

            context.completeRequest(returningItems: [response])
        } else {
            context.completeRequest(returningItems: nil)
        }
    }
}
