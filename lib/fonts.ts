import { Besley, Inter } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const fontSerif = Besley({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});
