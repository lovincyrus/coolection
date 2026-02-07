import SwiftUI

struct ContentView: View {
    @State private var tokenInput: String = ""
    @State private var hasSavedToken: Bool = false
    @State private var isEditing: Bool = false
    @State private var showDeleteConfirm: Bool = false
    @State private var extensionEnabled: Bool = false

    private let gray50 = Color(white: 0.98)
    private let gray100 = Color(white: 0.96)
    private let gray200 = Color(white: 0.91)
    private let gray500 = Color(red: 0.42, green: 0.45, blue: 0.50)
    private let gray800 = Color(red: 0.15, green: 0.16, blue: 0.18)
    private let gray900 = Color(red: 0.07, green: 0.07, blue: 0.08)

    private var tokenReady: Bool { hasSavedToken && !isEditing }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("🍵")
                    .font(.system(size: 24))
                Text("Coolection")
                    .font(.custom("Inter-Medium", size: 16))
                    .foregroundColor(gray900)
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 24)

            VStack(spacing: 0) {
                stepRow(number: "1", title: "Generate a token",
                        detail: "Go to coolection.co/settings and tap Generate Token.",
                        done: tokenReady)

                Divider().padding(.leading, 52)

                VStack(alignment: .leading, spacing: 0) {
                    stepRow(number: "2", title: "Paste your token", detail: nil, done: tokenReady)

                    Group {
                        if tokenReady {
                            savedTokenView
                        } else {
                            tokenInputView
                        }
                    }
                    .padding(.leading, 52)
                    .padding(.trailing, 20)
                    .padding(.bottom, 16)
                }

                Divider().padding(.leading, 52)

                VStack(alignment: .leading, spacing: 0) {
                    stepRow(number: "3", title: "Enable the extension",
                            detail: "Settings → Safari → Extensions → Coolection",
                            done: extensionEnabled)

                    if !extensionEnabled {
                        outlineButton("I've enabled it", tint: gray500) {
                            extensionEnabled = true
                            UserDefaults.standard.set(true, forKey: "extensionEnabled")
                        }
                        .padding(.leading, 52)
                        .padding(.trailing, 20)
                        .padding(.bottom, 16)
                    }
                }
            }
            .background(Color.white)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(gray200, lineWidth: 1)
            )
            .padding(.horizontal, 20)

            Spacer()
        }
        .background(gray50.ignoresSafeArea())
        .alert("Delete Token?", isPresented: $showDeleteConfirm) {
            Button("Delete", role: .destructive, action: deleteToken)
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You'll need to generate a new token from coolection.co/settings.")
        }
        .onAppear {
            hasSavedToken = KeychainHelper.read() != nil
            extensionEnabled = UserDefaults.standard.bool(forKey: "extensionEnabled")
        }
    }

    private func stepRow(number: String, title: String, detail: String?, done: Bool) -> some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(done ? Color(red: 0.22, green: 0.65, blue: 0.36) : gray100)
                    .frame(width: 24, height: 24)
                if done {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Text(number)
                        .font(.custom("Inter-Medium", size: 12))
                        .foregroundColor(gray500)
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.custom("Inter-Medium", size: 14))
                    .foregroundColor(done ? gray500 : gray900)
                if let detail = detail {
                    Text(detail)
                        .font(.custom("Inter-Regular", size: 12))
                        .foregroundColor(gray500)
                }
            }

            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }

    private var savedTokenView: some View {
        HStack(spacing: 8) {
            outlineButton("Replace") { isEditing = true }
            outlineButton("Delete", tint: Color(red: 0.70, green: 0.21, blue: 0.04)) { showDeleteConfirm = true }
        }
    }

    private var tokenInputView: some View {
        VStack(alignment: .leading, spacing: 10) {
            TextField("coolection_...", text: $tokenInput)
                .textFieldStyle(.plain)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .font(.system(size: 12, design: .monospaced))
                .foregroundColor(gray900)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(gray50)
                .cornerRadius(6)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(gray200, lineWidth: 1)
                )

            HStack(spacing: 8) {
                let valid = tokenInput.hasPrefix("coolection_")
                outlineButton("Save", action: saveToken)
                    .opacity(valid ? 1.0 : 0.4)
                    .disabled(!valid)

                if hasSavedToken {
                    outlineButton("Cancel", action: cancelEditing)
                }
            }
        }
    }

    private func outlineButton(_ label: String, tint: Color? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.custom("Inter-Medium", size: 13))
                .foregroundColor(tint ?? gray800)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(Color.white)
                .cornerRadius(6)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(tint ?? gray200, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }

    private func saveToken() {
        guard KeychainHelper.save(token: tokenInput) else { return }
        tokenInput = ""
        hasSavedToken = true
        isEditing = false
    }

    private func deleteToken() {
        KeychainHelper.delete()
        hasSavedToken = false
        isEditing = false
        tokenInput = ""
    }

    private func cancelEditing() {
        isEditing = false
        tokenInput = ""
    }
}
