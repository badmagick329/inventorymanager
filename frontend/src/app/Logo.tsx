'use client';
import React from 'react';
import Image from 'next/image';
import warehousePic from '../../public/warehouse.png';

export default function Logo() {
  return (
    <Image
      className='max-h-24 w-auto'
      src={warehousePic}
      alt='Picture of a warehouse'
    />
  );
}
