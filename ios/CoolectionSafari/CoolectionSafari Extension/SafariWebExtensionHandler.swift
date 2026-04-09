import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    private let defaults = AppConstants.defaults

    private let card = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let urlLabel = UILabel()
    private let statusLabel = UILabel()
    private let spinner = UIActivityIndicatorView(style: .medium)
    private let statusIcon = UIImageView()
    private let feedbackGenerator = UINotificationFeedbackGenerator()

    override func viewDidLoad() {
        super.viewDidLoad()
        feedbackGenerator.prepare()
        setupUI()
        handleShare()
    }

    // MARK: - UI

    private func setupUI() {
        view.backgroundColor = UIColor.black.withAlphaComponent(0.0)

        card.backgroundColor = .secondarySystemBackground
        card.layer.cornerRadius = 16
        card.layer.borderWidth = 0.5
        card.layer.borderColor = UIColor.separator.cgColor
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.25
        card.layer.shadowRadius = 24
        card.layer.shadowOffset = CGSize(width: 0, height: 6)
        card.translatesAutoresizingMaskIntoConstraints = false
        card.alpha = 0
        card.transform = CGAffineTransform(translationX: 0, y: 30)
        view.addSubview(card)

        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 10
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        // Load icon from main app bundle or fall back to SF Symbol
        if let appIcon = UIImage(named: "LargeIcon") {
            iconView.image = appIcon
        } else if let bundleIcon = Bundle.main.icon {
            iconView.image = bundleIcon
        } else {
            iconView.image = UIImage(systemName: "bookmark.fill")
            iconView.tintColor = .label
        }
        iconView.contentMode = .scaleAspectFit
        iconView.layer.cornerRadius = 10
        iconView.clipsToBounds = true
        iconView.translatesAutoresizingMaskIntoConstraints = false

        titleLabel.text = "Coolection"
        titleLabel.font = .systemFont(ofSize: 17, weight: .semibold)
        titleLabel.textColor = .label

        urlLabel.font = .systemFont(ofSize: 12)
        urlLabel.textColor = .tertiaryLabel
        urlLabel.textAlignment = .center
        urlLabel.lineBreakMode = .byTruncatingMiddle
        urlLabel.isHidden = true

        spinner.startAnimating()

        statusIcon.contentMode = .scaleAspectFit
        statusIcon.translatesAutoresizingMaskIntoConstraints = false
        statusIcon.alpha = 0

        statusLabel.text = "Saving..."
        statusLabel.font = .systemFont(ofSize: 14, weight: .medium)
        statusLabel.textColor = .secondaryLabel

        let statusRow = UIStackView(arrangedSubviews: [spinner, statusIcon, statusLabel])
        statusRow.axis = .horizontal
        statusRow.spacing = 6
        statusRow.alignment = .center

        stack.addArrangedSubview(iconView)
        stack.addArrangedSubview(titleLabel)
        stack.addArrangedSubview(urlLabel)
        stack.addArrangedSubview(statusRow)

        NSLayoutConstraint.activate([
            card.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            card.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            card.widthAnchor.constraint(equalToConstant: 240),

            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 28),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -28),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -20),

            iconView.widthAnchor.constraint(equalToConstant: 44),
            iconView.heightAnchor.constraint(equalToConstant: 44),
            statusIcon.widthAnchor.constraint(equalToConstant: 18),
            statusIcon.heightAnchor.constraint(equalToConstant: 18),
        ])

        UIView.animate(withDuration: 0.35, delay: 0, usingSpringWithDamping: 0.85, initialSpringVelocity: 0.5) {
            self.view.backgroundColor = UIColor.black.withAlphaComponent(0.3)
            self.card.alpha = 1
            self.card.transform = .identity
        }
    }

    private func showURL(_ urlString: String) {
        if let url = URL(string: urlString), let host = url.host {
            urlLabel.text = host.hasPrefix("www.") ? String(host.dropFirst(4)) : host
            urlLabel.isHidden = false
        }
    }

    private func showSuccess(duplicate: Bool = false) {
        feedbackGenerator.notificationOccurred(.success)

        let color = UIColor(red: 0.22, green: 0.65, blue: 0.36, alpha: 1)
        statusIcon.image = UIImage(systemName: duplicate ? "checkmark.circle" : "checkmark.circle.fill")
        statusIcon.tintColor = color

        statusIcon.transform = CGAffineTransform(scaleX: 0.3, y: 0.3)
        spinner.isHidden = true
        UIView.animate(withDuration: 0.4, delay: 0, usingSpringWithDamping: 0.5, initialSpringVelocity: 0.8) {
            self.statusIcon.alpha = 1
            self.statusIcon.transform = .identity
            self.statusLabel.text = duplicate ? "Already saved" : "Saved"
            self.statusLabel.textColor = color
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.animateDismiss()
        }
    }

    private func showError(_ message: String) {
        feedbackGenerator.notificationOccurred(.error)

        statusIcon.image = UIImage(systemName: "xmark.circle.fill")
        statusIcon.tintColor = .systemRed

        statusIcon.transform = CGAffineTransform(scaleX: 0.3, y: 0.3)
        spinner.isHidden = true
        UIView.animate(withDuration: 0.4, delay: 0, usingSpringWithDamping: 0.5, initialSpringVelocity: 0.8) {
            self.statusIcon.alpha = 1
            self.statusIcon.transform = .identity
            self.statusLabel.text = message
            self.statusLabel.textColor = .systemRed
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
            self.animateDismiss()
        }
    }

    private func animateDismiss() {
        UIView.animate(withDuration: 0.25, delay: 0, options: .curveEaseIn, animations: {
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
                            self?.showURL(url.absoluteString)
                            self?.saveURL(url.absoluteString)
                        } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                            self?.showURL(url.absoluteString)
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
            showError("Not signed in")
            return
        }

        let serverURL = (defaults?.string(forKey: "serverURL") ?? AppConstants.defaultServer)
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        guard let endpoint = URL(string: "\(serverURL)/api/item/create") else {
            showError("Invalid server")
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
                    self?.showSuccess(duplicate: true)
                case 401:
                    self?.showError("Invalid token")
                default:
                    self?.showError("Failed (\(http.statusCode))")
                }
            }
        }.resume()
    }
}

private extension Bundle {
    var icon: UIImage? {
        guard let icons = infoDictionary?["CFBundleIcons"] as? [String: Any],
              let primary = icons["CFBundlePrimaryIcon"] as? [String: Any],
              let files = primary["CFBundleIconFiles"] as? [String],
              let name = files.last else { return nil }
        return UIImage(named: name)
    }
}
