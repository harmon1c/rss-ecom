'use client';

import denisPhotoUrl from '@/assets/images/photos/denis.jpg';
import alexPhotoUrl from '@/assets/images/photos/harmon1c.jpg';
import juliaPhotoUrl from '@/assets/images/photos/julia.jpg';
import AboutUsCard from '@/components/about-us-card/AboutUsCard';
import AboutUsCardModal from '@/components/about-us-card/AboutUsCardModal';
import AlexDescription from '@/components/about-us-card/AlexDescription';
import DenisDescription from '@/components/about-us-card/DenisDescription';
import JuliaDescription from '@/components/about-us-card/JuliaDescription';
import RSSLogo from '@/components/svg/rss-logo';
import Link from 'next/link';
import { useState } from 'react';

export default function AboutUs(): JSX.Element {
  const [alexModalOpen, setAlexModalOpen] = useState(false);
  const [juliaModalOpen, setJuliaModalOpen] = useState(false);
  const [denisModalOpen, setDenisModalOpen] = useState(false);
  return (
    <div className="flex flex-column gap-10 justify-center flex-wrap container mx-auto py-8 px-4 md:px-6">
      <div className="flex gap-10 justify-center flex-wrap ">
        <AboutUsCard
          description={AlexDescription({ full: false })}
          full={false}
          githubLink="https://github.com/harmon1c"
          name="Alex"
          photoUrl={alexPhotoUrl}
          role="Team Lead | Front-End Developer"
          setModalOpen={setAlexModalOpen}
        ></AboutUsCard>
        <AboutUsCard
          description={JuliaDescription({ full: false })}
          full={false}
          githubLink="https://github.com/JuliaVasilko"
          name="Yuliia"
          photoUrl={juliaPhotoUrl}
          role="Front-End Developer"
          setModalOpen={setJuliaModalOpen}
        ></AboutUsCard>
        <AboutUsCard
          description={DenisDescription({ full: false })}
          full={false}
          githubLink="https://github.com/dyeresko"
          name="Denis"
          photoUrl={denisPhotoUrl}
          role="Front-End Developer"
          setModalOpen={setDenisModalOpen}
        ></AboutUsCard>
        <AboutUsCardModal
          description={AlexDescription({ full: true })}
          full={true}
          githubLink="https://github.com/harmon1c"
          modalOpen={alexModalOpen}
          name="Alex"
          photoUrl={alexPhotoUrl}
          role="Team Lead | Front-End Developer"
          setModalOpen={setAlexModalOpen}
        ></AboutUsCardModal>
        <AboutUsCardModal
          description={JuliaDescription({ full: true })}
          full={true}
          githubLink="https://github.com/JuliaVasilko"
          modalOpen={juliaModalOpen}
          name="Yuliia"
          photoUrl={juliaPhotoUrl}
          role="Front-End Developer"
          setModalOpen={setJuliaModalOpen}
        ></AboutUsCardModal>
        <AboutUsCardModal
          description={DenisDescription({ full: true })}
          full={true}
          githubLink="https://github.com/dyeresko"
          modalOpen={denisModalOpen}
          name="Denis"
          photoUrl={denisPhotoUrl}
          role="Front-End Developer"
          setModalOpen={setDenisModalOpen}
        ></AboutUsCardModal>
      </div>
      <Link href="https://rs.school/">
        <RSSLogo />
      </Link>
    </div>
  );
}
