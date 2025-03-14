import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary-container dark:bg-inverse-surface text-on-secondary-container dark:text-inverse-on-surface relative mt-20 pt-20 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col gap-6">
          <div className="font-headline text-2xl text-primary dark:text-primary-fixed">HotelB</div>
          <p className="font-body text-body-md text-secondary">
            Curating peaceful hospitality in the heart of Kerala since 2024. Experience serenity and deep heritage.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-body font-bold uppercase tracking-wider text-primary">Discover</h4>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">About Us</a>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">Sustainability</a>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">Careers</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-body font-bold uppercase tracking-wider text-primary">Support</h4>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">Contact Us</a>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">Privacy Policy</a>
          <a className="font-body text-secondary hover:text-primary transition-colors text-sm" href="#">Terms of Service</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-body font-bold uppercase tracking-wider text-primary">Connect</h4>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary transition-all group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-primary">share</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary transition-all group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-primary">public</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary transition-all group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-primary">mail</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-12 mt-12 border-t border-outline-variant/30 text-center">
        <p className="font-body text-secondary text-sm">© 2024 HotelB. All rights reserved. Crafted for serenity.</p>
      </div>
    </footer>
  );
};

export default Footer;
