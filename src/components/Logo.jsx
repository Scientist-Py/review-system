import React from 'react';

export default function Logo({ className = "w-20 h-20" }) {
  return (
    <div className="flex flex-col items-center justify-center select-none animate-float">
      <img
        src="/logo.jpg"
        alt="Chapter One Cafe Logo"
        className={`${className} rounded-full object-cover shadow-md border border-luxury-border`}
      />
    </div>
  );
}
