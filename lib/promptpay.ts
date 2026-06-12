// @ts-ignore
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";

/**
 * Generates a PromptPay QR code and returns it as a Base64 PNG image URL.
 * @param amount The total price to generate the QR code for.
 * @returns A promise that resolves to the Base64 image URL.
 */
export async function generatePromptPayQR(amount: number): Promise<string> {
  const promptPayId = "0800000000"; // Hardcoded default PromptPay ID
  const payload = generatePayload(promptPayId, { amount });
  
  const options = {
    errorCorrectionLevel: "H" as const,
    type: "image/png" as const,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  return await qrcode.toDataURL(payload, options);
}
