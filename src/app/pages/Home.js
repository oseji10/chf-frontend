import Header from "./../components/home/header";
import Hero from "./../components/home/hero";
import About from "./../components/home/about";
import ImageGallery from "../components/home/imageGallery";

function Home() {
 
  return (
    <div className="App">
      <Header />
      <Hero />
      <About />
      <ImageGallery/>
      <footer className="container">Copyright 2021 EMGE Resources</footer>
    </div>
  );
}

export default Home;
