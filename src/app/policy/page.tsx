import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
import { Bell, Eye, FileText, Shield, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage(): JSX.Element {
  const breadcrumbItems: BreadcrumbItemProps[] = [
    { href: '/', label: 'Home' },
    { href: '/policy', isCurrentPage: true, label: 'Privacy Policy' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center dark:text-amber-500/50">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 text-center">Last updated: May 15, 2025</p>

        {/* Introduction */}
        <section className="mb-10">
          <p className="mb-4">
            At Literary Haven, we respect your privacy and are committed to protecting your personal data. This privacy
            policy will inform you about how we look after your personal data when you visit our website and tell you
            about your privacy rights and how the law protects you.
          </p>
          <p className="mb-4">
            This privacy policy applies to all personal information we collect through our website at storyhive.com, as
            well as through email, text, or other electronic communications between you and our website.
          </p>
        </section>

        {/* Policy sections with icons */}
        <div className="space-y-12 ">
          <PolicySection
            icon={<Shield className="h-7 w-7 text-primary" />}
            id="information-collection"
            title="Information We Collect"
          >
            <p className="mb-4">
              We collect several types of information from and about users of our website, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-medium">Personal information:</span> Name, postal address, email address,
                telephone number, and payment information when you create an account, place an order, or sign up for our
                newsletter.
              </li>
              <li>
                <span className="font-medium">Usage information:</span> How you use our website, including browsing
                patterns, product preferences, and search queries.
              </li>
              <li>
                <span className="font-medium">Device information:</span> Information about your computer, internet
                connection, and browser type.
              </li>
            </ul>
          </PolicySection>

          <PolicySection
            icon={<Shield className="h-7 w-7 text-primary" />}
            id="information-usage"
            title="How We Use Your Information"
          >
            <p className="mb-4">We use information that we collect about you or that you provide to us:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To present our website and its contents to you.</li>
              <li>To process and fulfill your orders, including shipping and handling.</li>
              <li>To provide you with information, products, or services that you request from us.</li>
              <li>To fulfill any other purpose for which you provide it.</li>
              <li>To send you promotional content and newsletters (if you&apos;ve opted in).</li>
              <li>To improve our website and customer service.</li>
            </ul>
          </PolicySection>

          <PolicySection
            icon={<Eye className="h-7 w-7 text-primary" />}
            id="information-disclosure"
            title="Information Disclosure"
          >
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may disclose personal
              information:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To our subsidiaries and affiliates.</li>
              <li>
                To contractors, service providers, and other third parties we use to support our business (such as
                shipping carriers and payment processors).
              </li>
              <li>To comply with any court order, law, or legal process.</li>
              <li>To protect the rights, property, or safety of our company, our customers, or others.</li>
            </ul>
          </PolicySection>

          <PolicySection
            icon={<FileText className="h-7 w-7 text-primary" />}
            id="cookies"
            title="Cookies and Tracking Technologies"
          >
            <p className="mb-4">
              Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze
              site traffic, and personalize content. We use:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-medium">Essential cookies:</span> Required for the website to function properly.
              </li>
              <li>
                <span className="font-medium">Analytical cookies:</span> Help us understand how visitors interact with
                our website.
              </li>
              <li>
                <span className="font-medium">Marketing cookies:</span> Used to track visitors across websites to
                display relevant advertisements.
              </li>
            </ul>
            <p>
              You can set your browser to refuse all or some browser cookies or to alert you when cookies are being
              sent. If you disable or refuse cookies, please note that some parts of this website may then be
              inaccessible or not function properly.
            </p>
          </PolicySection>

          <PolicySection
            icon={<Bell className="h-7 w-7 text-primary dark:text-amber-500/50" />}
            id="communications"
            title="Communications and Marketing"
          >
            <p className="mb-4">
              If you provide us with your email address, we may send you emails about our products, services, and
              promotions. You can opt out of receiving these communications at any time by:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Following the unsubscribe instructions contained in the emails.</li>
              <li>Contacting us directly at support@literaryhaven.com.</li>
              <li>Adjusting your communication preferences in your account settings.</li>
            </ul>
          </PolicySection>

          <PolicySection
            icon={<UserCheck className="h-7 w-7 text-primary dark:text-amber-500/50" />}
            id="your-rights"
            title="Your Rights"
          >
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The right to access your personal information.</li>
              <li>The right to rectify inaccurate personal information.</li>
              <li>The right to request erasure of your personal information.</li>
              <li>The right to restrict processing of your personal information.</li>
              <li>The right to data portability.</li>
              <li>The right to object to processing of your personal information.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at privacy@literaryhaven.com.</p>
          </PolicySection>
        </div>

        {/* Contact section */}
        <section className="mt-12 bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 dark:text-amber-500/50">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="ml-4">
            <p className="font-medium">Story Hive Book Store</p>
            <p>828 Broadway</p>
            <p>New York, NY 10003</p>
            <p>United States</p>
            <p className="mt-2 dark:text-amber-400/80">Email: admin@storyhive.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface PolicySectionProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  id: string;
  title: string;
}

function PolicySection({ children, icon, id, title }: PolicySectionProps): JSX.Element {
  return (
    <section className="scroll-mt-20" id={id}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-semibold dark:text-amber-500/50">{title}</h2>
      </div>
      <div className="ml-10">{children}</div>
    </section>
  );
}
