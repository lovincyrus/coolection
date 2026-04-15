import UIKit
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
    private let card = UIView()
    private let icon = UIImageView()
    private let label = UILabel()
    private let spinner = UIActivityIndicatorView(style: .medium)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor.black.withAlphaComponent(0.3)
        setupCard()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        Task { await handleShare() }
    }

    private func setupCard() {
        card.translatesAutoresizingMaskIntoConstraints = false
        card.backgroundColor = .systemBackground
        card.layer.cornerRadius = 16
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.15
        card.layer.shadowRadius = 20
        card.layer.shadowOffset = CGSize(width: 0, height: 8)
        view.addSubview(card)

        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.tintColor = .label
        icon.contentMode = .scaleAspectFit
        card.addSubview(icon)

        spinner.translatesAutoresizingMaskIntoConstraints = false
        spinner.hidesWhenStopped = true
        spinner.startAnimating()
        card.addSubview(spinner)

        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = .systemFont(ofSize: 16, weight: .medium)
        label.textColor = .label
        label.text = "Saving to Coolection…"
        label.textAlignment = .center
        card.addSubview(label)

        NSLayoutConstraint.activate([
            card.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            card.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            card.widthAnchor.constraint(equalToConstant: 260),
            card.heightAnchor.constraint(equalToConstant: 160),

            spinner.topAnchor.constraint(equalTo: card.topAnchor, constant: 32),
            spinner.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            icon.topAnchor.constraint(equalTo: card.topAnchor, constant: 28),
            icon.centerXAnchor.constraint(equalTo: card.centerXAnchor),
            icon.widthAnchor.constraint(equalToConstant: 44),
            icon.heightAnchor.constraint(equalToConstant: 44),

            label.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            label.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            label.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -28),
        ])
    }

    private func handleShare() async {
        guard let url = await extractURL() else {
            await show(state: .failure("No link found"))
            return
        }

        let token = KeychainHelper.read() ?? ""
        let serverURL = AppConstants.defaults?.string(forKey: "serverURL") ?? AppConstants.defaultServer

        guard !token.isEmpty else {
            await show(state: .failure("Open Coolection to sign in"))
            return
        }

        let client = APIClient(serverURL: serverURL, token: token)
        do {
            try await client.createItem(url: url.absoluteString)
            await show(state: .success)
        } catch {
            await show(state: .failure("Could not save link"))
        }
    }

    private func extractURL() async -> URL? {
        guard
            let items = extensionContext?.inputItems as? [NSExtensionItem]
        else { return nil }

        for item in items {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    if let url = try? await provider.loadItem(forTypeIdentifier: UTType.url.identifier) as? URL {
                        return url
                    }
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    if let text = try? await provider.loadItem(forTypeIdentifier: UTType.plainText.identifier) as? String,
                       let url = URL(string: text),
                       url.scheme?.hasPrefix("http") == true {
                        return url
                    }
                }
            }
        }
        return nil
    }

    private enum ShareState {
        case success
        case failure(String)
    }

    @MainActor
    private func show(state: ShareState) async {
        spinner.stopAnimating()
        switch state {
        case .success:
            icon.image = UIImage(systemName: "checkmark.circle.fill")
            icon.tintColor = .systemGreen
            label.text = "Saved to Coolection"
        case .failure(let message):
            icon.image = UIImage(systemName: "exclamationmark.triangle.fill")
            icon.tintColor = .systemOrange
            label.text = message
        }
        try? await Task.sleep(nanoseconds: 900_000_000)
        extensionContext?.completeRequest(returningItems: nil)
    }
}
