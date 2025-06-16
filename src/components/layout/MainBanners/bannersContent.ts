import type { Banner } from '@/components/layout/MainBanners/BannerSlider';

const banners: Banner[] = [
  {
    colorScheme: 'light',
    ctaLink: '/products',
    ctaText: 'View Books',
    customStyles: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md',
      description: 'text-amber-950 font-medium text-lg p-2',
      overlay: 'bg-gradient-to-r from-white/80 to-transparent',
      position: 'left',
      textAlign: 'left',
      title: 'text-amber-950 font-bold font-serif text-4xl md:text-5xl p-3',
      titleUnderline: {
        color: '#F59E0B',
        height: '4px',
        show: false,
        width: '120px',
      },
    },
    description: 'Discover our handpicked summer books for beach days',
    id: '1',
    imageUrl: '/img/banners/banner-3.jpg',
    title: 'Summer Reading Collection',
  },
  {
    colorScheme: 'dark',
    ctaLink: '/contacts',
    ctaText: 'Contact Us',
    customStyles: {
      button: 'bg-primary hover:bg-primary/90 text-black',
      description: 'text-gray-200',
      overlay: 'bg-gradient-to-r from-black/70 to-transparent',
      position: 'left',
      title: 'text-white font-bold',
    },
    description: 'Come to our store and receive special discounts on our books',
    id: '2',
    imageUrl: '/img/banners/banner-2.jpg',
    title: 'Visit our store',
  },
  {
    colorScheme: 'light',
    ctaLink: '/sale',
    ctaText: 'Special Offers',
    customStyles: {
      button: 'bg-accent text-white hover:bg-accent/80',
      overlay: 'bg-gradient-to-t from-white/70 to-transparent',
      position: 'center',
      textAlign: 'center',
      title: 'text-black font-extrabold md:leading-tight',
    },
    description: 'Explore our latest discounts and special offers on bestsellers',
    id: '3',
    imageUrl: '/img/banners/banner-1.jpg',
    title: 'Our special offers & discounts',
  },
];

export default banners;
