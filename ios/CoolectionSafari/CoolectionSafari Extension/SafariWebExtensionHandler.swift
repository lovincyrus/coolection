import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    private let defaults = AppConstants.defaults

    private let card = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let statusLabel = UILabel()
    private let spinner = UIActivityIndicatorView(style: .medium)
    private let checkmark = UIImageView()

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        handleShare()
    }

    // MARK: - UI

    private func setupUI() {
        view.backgroundColor = UIColor.black.withAlphaComponent(0.0)

        card.backgroundColor = .systemBackground
        card.layer.cornerRadius = 16
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.15
        card.layer.shadowRadius = 20
        card.layer.shadowOffset = CGSize(width: 0, height: 4)
        card.translatesAutoresizingMaskIntoConstraints = false
        card.alpha = 0
        card.transform = CGAffineTransform(translationX: 0, y: 30)
        view.addSubview(card)

        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        iconView.image = UIImage(named: "LargeIcon")
        iconView.contentMode = .scaleAspectFit
        iconView.layer.cornerRadius = 8
        iconView.clipsToBounds = true
        iconView.translatesAutoresizingMaskIntoConstraints = false

        titleLabel.text = "Coolection"
        titleLabel.font = .systemFont(ofSize: 17, weight: .semibold)
        titleLabel.textColor = .label

        statusLabel.text = "Saving..."
        statusLabel.font = .systemFont(ofSize: 14)
        statusLabel.textColor = .secondaryLabel

        spinner.startAnimating()

        checkmark.image = UIImage(systemName: "checkmark.circle.fill")
        checkmark.tintColor = UIColor(red: 0.22, green: 0.65, blue: 0.36, alpha: 1)
        checkmark.contentMode = .scaleAspectFit
        checkmark.translatesAutoresizingMaskIntoConstraints = false
        checkmark.alpha = 0

        let statusRow = UIStackView(arrangedSubviews: [spinner, checkmark, statusLabel])
        statusRow.axis = .horizontal
        statusRow.spacing = 6
        statusRow.alignment = .center

        stack.addArrangedSubview(iconView)
        stack.addArrangedSubview(titleLabel)
        stack.addArrangedSubview(statusRow)

        NSLayoutConstraint.activate([
            card.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            card.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            card.widthAnchor.constraint(equalToConstant: 220),

            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 28),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -28),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -20),

            iconView.widthAnchor.constraint(equalToConstant: 40),
            iconView.heightAnchor.constraint(equalToConstant: 40),
            checkmark.widthAnchor.constraint(equalToConstant: 18),
            checkmark.heightAnchor.constraint(equalToConstant: 18),
        ])

        UIView.animate(withDuration: 0.3, delay: 0, options: .curveEaseOut) {
            self.view.backgroundColor = UIColor.black.withAlphaComponent(0.3)
            self.card.alpha = 1
            self.card.transform = .identity
        }
    }

    private func showSuccess() {
        UIView.animate(withDuration: 0.25) {
            self.spinner.alpha = 0
            self.checkmark.alpha = 1
            self.statusLabel.text = "Saved"
            self.statusLabel.textColor = UIColor(red: 0.22, green: 0.65, blue: 0.36, alpha: 1)
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            self.dismiss()
        }
    }

    private func showError(_ message: String) {
        UIView.animate(withDuration: 0.25) {
            self.spinner.alpha = 0
            self.statusLabel.text = message
            self.statusLabel.textColor = .systemRed
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.dismiss()
        }
    }

    private func dismiss() {
        UIView.animate(withDuration: 0.25, animations: {
            self.view.backgroundColor = UIColor.black.withAlphaComponent(0.0)
            self.card.alpha = 0
            self.card.transform = CGAffineTransform(translationX: 0, y: 20).concatenating(
                CGAffineTransform(scaleX: 0.95, y: 0.95)
            )
        }) { _ in
            self.extensionContext?.completeRequest(returningItems: nil)
        }
    }

    // MARK: - Share handling

    private func handleShare() {
        guard let item = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = item.attachments else {
            showError("Nothing to share")
            return
        }

        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.url.identifier) { [weak self] item, _ in
                    DispatchQueue.main.async {
                        if let url = item as? URL {
                            self?.saveURL(url.absoluteString)
                        } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                            self?.saveURL(url.absoluteString)
                        } else {
                            self?.showError("Could not read URL")
                        }
                    }
                }
                return
            }
        }

        showError("No URL found")
    }

    private func saveURL(_ urlString: String) {
        guard let token = KeychainHelper.read() else {
            showError("Set up token first")
            return
        }

        let serverURL = (defaults?.string(forKey: "serverURL") ?? AppConstants.defaultServer)
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        guard let endpoint = URL(string: "\(serverURL)/api/item/create") else {
            showError("Invalid server URL")
            return
        }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["url": urlString])

        URLSession.shared.dataTask(with: request) { [weak self] _, response, error in
            DispatchQueue.main.async {
                if error != nil {
                    self?.showError("Network error")
                    return
                }
                guard let http = response as? HTTPURLResponse else {
                    self?.showError("No response")
                    return
                }
                switch http.statusCode {
                case 200..<300:
                    self?.showSuccess()
                case 409:
                    self?.showSuccess() // already saved
                case 401:
                    self?.showError("Invalid token")
                default:
                    self?.showError("Failed (\(http.statusCode))")
                }
            }
        }.resume()
    }
}
