import React from 'react';
import { useNavigate } from 'react-router-dom';
import mealboximg from '../assets/logos/new_mealbox.png';
import cateringImg from '../assets/logos/catering.png';
import { useAuthContext } from '../utils/AuthContext';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';

const SERVICES = [
  {
    img: mealboximg,
    title: 'Meal Box',
    tagline: 'Hearty, flavorful, aromatic, wholesome.',
    description:
      'Perfect for small gatherings, office lunches, or personal occasions, our South Indian vegetarian meal boxes bring you the same Sujatha Catering quality in a convenient, ready-to-eat format. Each box is carefully packed with balanced portions, freshly prepared items, and authentic flavors that reflect our culinary heritage.',
    points: ['Classic ₹179 or Premium ₹199', 'Pickup from 5 locations', 'Door delivery via Rapido'],
    to: '/mealbox',
    cta: 'Order meal boxes',
  },
  {
    img: cateringImg,
    title: 'Catering',
    tagline: 'Delicious, traditional, generous, satisfying.',
    description:
      "A full-service, end-to-end dining experience. We cater breakfast, lunch and dinner across four curated tiers. Whether it's a simple family event or an elegant wedding celebration, we tailor our service to match your needs — combining traditional South Indian flavors with elegant presentation, impeccable hygiene, and seamless execution.",
    points: ['Basic, Classic, Premium & Luxury', 'Breakfast, lunch and dinner', 'Priced per plate'],
    to: '/catering/order',
    cta: 'Start an order',
  },
];

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <PageShell>
      <PageHero eyebrow="What we do" title="Our services">
        Two ways to eat well with us — full-service catering for the big days,
        and meal boxes for everything in between.
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="flex animate-fade-up flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card transition-shadow duration-300 hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden bg-sand-100">
                <img
                  src={service.img}
                  alt={service.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h2 className="font-display text-3xl text-sand-900">{service.title}</h2>
                <p className="mt-1.5 text-[0.9375rem] font-medium text-brand-600">
                  {service.tagline}
                </p>

                <ul className="mt-5 space-y-2">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[0.9375rem] text-sand-700">
                      <svg
                        viewBox="0 0 20 20"
                        className="mt-1 h-4 w-4 shrink-0 text-success-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 10.5l4 4 8-9" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-sand-600">
                  {service.description}
                </p>

                <div className="mt-7">
                  {user ? (
                    <Button className="sm:w-auto sm:px-7" onClick={() => navigate(service.to)}>
                      {service.cta}
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 10h11M10 5l5 5-5 5" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="sm:w-auto sm:px-7"
                      onClick={() => navigate('/login')}
                    >
                      Log in to order
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Services;
