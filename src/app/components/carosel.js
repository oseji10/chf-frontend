import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Overlay from './overlay';

function Carosel({ items, id }) {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel id={id} activeIndex={index} onSelect={handleSelect}>
    
      {items.map((item) => {
        return (
          <Carousel.Item key={item.src}>
            <Overlay />
            <img
              className="d-block w-100"
              src={item.src}
              alt={item.alt}
            />
            <Carousel.Caption>
            
               <h3>{(item.title)?item.title:""}</h3>
              <p>{(item.description)?item.description:""}</p>
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
}

export default Carosel;
