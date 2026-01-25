import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
    return (
        <div className="py-24">
            <Container>
                <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
                <div className="mt-8 prose prose-slate max-w-none">
                    <p>Last updated: January 25, 2026</p>
                    <p>
                        At withWilma, we take your privacy seriously. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you visit our website or use our
                        hiring platform.
                    </p>
                    <h2>Information We Collect</h2>
                    <p>
                        We collect information that you potentially provide to us when you register for an
                        account, express interest in obtaining information about us or our products and
                        services, when you participate in activities on the Services, or otherwise when you
                        contact us.
                    </p>
                    <h2>How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our Services for a variety of business
                        purposes described below:
                    </p>
                    <ul>
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send administrative information to you.</li>
                        <li>To protect our Services.</li>
                    </ul>
                </div>
            </Container>
        </div>
    );
}
