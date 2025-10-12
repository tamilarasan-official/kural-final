import React, { createContext, useContext, useState, useEffect } from 'react';
import { Image } from 'react-native';

interface Banner {
  id: number;
  filename: string;
  imageUri: string;
  localUri?: string | null;
}

interface BannerContextType {
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  removeBanner: (id: number) => void;
  updateBanners: (banners: Banner[]) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Resolve local asset URIs for banners in assets/images
  const admk1 = Image.resolveAssetSource(require('../assets/images/ADMK 1.jpg')).uri;
  const admk2 = Image.resolveAssetSource(require('../assets/images/admk 2.jpg')).uri;

  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      filename: 'ADMK 1.jpg',
      imageUri: admk1,
      localUri: admk1,
    },
    {
      id: 2,
      filename: 'admk 2.jpg',
      imageUri: admk2,
      localUri: admk2,
    },
  ]);

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner = {
      ...banner,
      id: Date.now(),
    };
    setBanners(prev => [...prev, newBanner]);
  };

  const removeBanner = (id: number) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
  };

  const updateBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, removeBanner, updateBanners }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};
