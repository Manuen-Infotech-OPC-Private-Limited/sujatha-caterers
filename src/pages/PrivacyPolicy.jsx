import React from 'react';
import { Link } from 'react-router-dom';
import PageShell, { PageHero } from '../components/ui/PageShell';
import { BUSINESS } from '../data/business';

const SECTIONS = [
  { id: 'collect', title: '1. Information we collect' },
  { id: 'use', title: '2. Use of your information' },
  { id: 'disclosure', title: '3. Disclosure of your information' },
  { id: 'security', title: '4. Security of your information' },
  { id: 'rights', title: '5. Your rights' },
  { id: 'contact', title: '6. Contact us' },
];

const H2 = ({ id, children }) => (
  <h2 id={id} className="mt-10 scroll-mt-28 font-display text-2xl text-sand-900">
    {children}
  </h2>
);

const List = ({ children }) => (
  <ul className="mt-3 space-y-2.5">{children}</ul>
);

const LI = ({ children }) => (
  <li className="flex gap-2.5">
    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
    <span>{children}</span>
  </li>
);

const PrivacyPolicy = () => (
  <PageShell>
    <PageHero compact eyebrow="Legal" title="Privacy Policy">
      How we collect, use and safeguard your information when you use our
      website and catering services.
    </PageHero>

    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_16rem] lg:gap-16">
        <article className="max-w-3xl text-[1.0625rem] leading-relaxed text-sand-700">
          <p className="text-sm text-sand-500">Last updated: March 4, 2026</p>

          <p className="mt-5">
            At {BUSINESS.name}, we are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website and use our
            catering services.
          </p>

          <H2 id="collect">1. Information we collect</H2>
          <p className="mt-3">
            We may collect information about you in a variety of ways. The
            information we may collect on the website includes:
          </p>
          <List>
            <LI>
              <strong className="font-semibold text-sand-900">Personal data:</strong>{' '}
              personally identifiable information such as your name, shipping
              address, email address and telephone number, that you voluntarily
              give us when you register or take part in activities on the site.
            </LI>
            <LI>
              <strong className="font-semibold text-sand-900">Service data:</strong>{' '}
              information related to your catering needs, such as event type,
              approximate number of guests, and specific notes or requests.
            </LI>
            <LI>
              <strong className="font-semibold text-sand-900">Technical data:</strong>{' '}
              we may collect location data (with your permission) to verify
              service availability in your area. We also collect FCM tokens to
              send push notifications about your orders and enquiries.
            </LI>
          </List>

          <H2 id="use">2. Use of your information</H2>
          <p className="mt-3">
            Having accurate information about you lets us provide a smooth,
            efficient and customised experience. Specifically, we may use it to:
          </p>
          <List>
            <LI>Create and manage your account.</LI>
            <LI>Process your orders and consultation requests.</LI>
            <LI>Email or call you regarding your account or order.</LI>
            <LI>Verify service availability based on your location.</LI>
            <LI>Send push notifications about order updates and promotions.</LI>
            <LI>Improve our website and services.</LI>
          </List>

          <H2 id="disclosure">3. Disclosure of your information</H2>
          <p className="mt-3">
            We may share information we have collected about you in certain
            situations:
          </p>
          <List>
            <LI>
              <strong className="font-semibold text-sand-900">By law or to protect rights:</strong>{' '}
              where release is necessary to respond to legal process, investigate
              or remedy potential violations of our policies, or protect the
              rights, property and safety of others.
            </LI>
            <LI>
              <strong className="font-semibold text-sand-900">Third-party service providers:</strong>{' '}
              parties that perform services for us or on our behalf, including
              payment processing, data analysis, email delivery, hosting and
              customer service (for example, Firebase for authentication and
              notifications).
            </LI>
          </List>

          <H2 id="security">4. Security of your information</H2>
          <p className="mt-3">
            We use administrative, technical and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure what you provide, please be aware that no
            security measures are perfect or impenetrable, and no method of data
            transmission can be guaranteed against interception or misuse.
          </p>

          <H2 id="rights">5. Your rights</H2>
          <p className="mt-3">
            You have the right to access, correct or delete your personal
            information:
          </p>
          <List>
            <LI>
              <strong className="font-semibold text-sand-900">Access &amp; update:</strong>{' '}
              view and update your personal details (name, email, address) from
              your Profile page.
            </LI>
            <LI>
              <strong className="font-semibold text-sand-900">Account deletion:</strong>{' '}
              you may request deletion of your account and all associated data.
              For your security, requests must be submitted through our official{' '}
              <Link
                to="/request-deletion"
                className="font-semibold text-brand-600 underline underline-offset-4 hover:text-brand-700"
              >
                data deletion request form
              </Link>
              . Once verified and processed, your profile, order history and
              consultation requests are permanently removed from our active
              databases.
            </LI>
          </List>

          <H2 id="contact">6. Contact us</H2>
          <p className="mt-3">
            If you have questions or comments about this Privacy Policy, contact
            us at:
          </p>
          <address className="mt-4 rounded-2xl border border-sand-200 bg-white p-5 text-[0.9375rem] leading-relaxed text-sand-700 not-italic shadow-card">
            <strong className="block font-semibold text-sand-900">{BUSINESS.name}</strong>
            {BUSINESS.address}
            <br />
            Phone:{' '}
            <a
              href={BUSINESS.phoneHref}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {BUSINESS.phone}
            </a>
            <br />
            Email:{' '}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {BUSINESS.email}
            </a>
          </address>
        </article>

        {/* on-page navigation */}
        <nav aria-label="On this page" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
            On this page
          </p>
          <ul className="mt-3 space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-1.5 text-[0.9375rem] text-sand-600 transition-colors hover:bg-sand-100 hover:text-brand-600"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  </PageShell>
);

export default PrivacyPolicy;
