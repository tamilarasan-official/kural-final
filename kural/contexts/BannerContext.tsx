import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      filename: 'ADMK 1.jpg',
      imageUri: 'https://via.placeholder.com/300x150/4CAF50/FFFFFF?text=ADMK+1',
      localUri: null,
    },
    {
      id: 2,
      filename: 'admk 2.jpg',
      imageUri: 'https://via.placeholder.com/300x150/2196F3/FFFFFF?text=ADMK+2',
      localUri: null,
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
