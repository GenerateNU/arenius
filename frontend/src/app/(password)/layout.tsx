import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
