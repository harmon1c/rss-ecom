import UnderDevelopment from '@/components/layout/UnderDevelopment/UnderDevelopment';

export default function DefaultPage(): JSX.Element {
  return (
    <UnderDevelopment
      message="We're currently working on implementing this feature. Please check back soon!"
      returnLabel="Return to Homepage"
      returnPath="/"
      title="Feature Coming Soon"
    />
  );
}
