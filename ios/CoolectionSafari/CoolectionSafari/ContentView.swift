import SwiftUI

struct ContentView: View {
    @State private var tokenInput: String = ""
    @State private var saved: Bool = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Text("🍵")
                .font(.system(size: 48))

            Text("Coolection")
                .font(.title2)
                .fontWeight(.medium)

            VStack(spacing: 12) {
                TextField("Paste API token from coolection.co/settings", text: $tokenInput)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .font(.system(.body, design: .monospaced))

                Button(action: saveToken) {
                    Text(saved ? "Saved" : "Save")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(tokenInput.isEmpty || !tokenInput.hasPrefix("coolection_"))
            }
            .padding(.horizontal)

            Text("After saving, enable the extension in\nSettings → Safari → Extensions")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Spacer()
        }
        .padding()
        .onAppear {
            if KeychainHelper.read() != nil {
                saved = true
            }
        }
    }

    private func saveToken() {
        let success = KeychainHelper.save(token: tokenInput)
        if success {
            saved = true
        }
    }
}
