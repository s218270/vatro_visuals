import React from "react";
import Image from "next/image";

export default function CarouselItem({ imgUrl, imgTitle }) {
  return (
    <div className="carousel-card">
      <Image
        src={imgUrl}
        alt={imgTitle}
        width={400}
        height={300}
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
