import type { StaticImageData } from 'next/image';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import '@/styles/scrollbar.scss';
import { type SetStateAction } from 'react';

import AboutUsCard from './AboutUsCard';

type propsType = {
  description: JSX.Element;
  full: boolean;
  githubLink: string;
  modalOpen: boolean | undefined;
  name: string;
  photoUrl: StaticImageData;
  role: string;
  setModalOpen: (value: SetStateAction<boolean>) => void;
};

export default function ChangePasswordForm(props: propsType): JSX.Element | null {
  const handleOpenChange = (open: boolean): void => {
    props.setModalOpen(open);
  };
  return (
    <Dialog onOpenChange={handleOpenChange} open={props.modalOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AboutUsCard
          description={props.description}
          full={true}
          githubLink={props.githubLink}
          name={props.name}
          photoUrl={props.photoUrl}
          role={props.role}
          setModalOpen={props.setModalOpen}
        ></AboutUsCard>
      </DialogContent>
    </Dialog>
  );
}
