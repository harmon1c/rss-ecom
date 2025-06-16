'use client';

import type { StaticImageData } from 'next/image';
import type { Dispatch, SetStateAction } from 'react';

import GitHubLogo from '@/components/svg/github-logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

type propsType = {
  description: JSX.Element;
  full: boolean;
  githubLink: string;
  name: string;
  photoUrl: StaticImageData;
  role: string;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function AboutUsCard(props: propsType): JSX.Element {
  return (
    <Card
      className={
        !props.full
          ? 'cursor-pointer transition-transform duration-400 hover:-translate-y-2 hover:shadow-lg w-full max-w-sm'
          : 'w-full'
      }
      onClick={() => props.setModalOpen(true)}
    >
      <CardHeader className="flex items-center text-center">
        <Image alt="avatar" className="rounded-full" height={100} src={props.photoUrl} width={100} />
        <CardTitle>
          <div className="flex items-center gap-2">
            <span>{props.name}</span>
            <Link href={props.githubLink} onClick={(e) => e.stopPropagation()} target="blank">
              <GitHubLogo />
            </Link>
          </div>
        </CardTitle>
        <span>{props.role}</span>
      </CardHeader>
      <CardContent className="space-y-4">{props.description}</CardContent>
    </Card>
  );
}
