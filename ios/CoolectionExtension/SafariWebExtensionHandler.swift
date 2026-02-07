import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let message: Any? = request?.userInfo?[SFExtensionMessageKey]

        guard let body = message as? [String: Any],
              let action = body["action"] as? String else {
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
