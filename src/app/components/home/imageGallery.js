const partnersImages = [
  { src: "./images/partners/CHAI.png", alt: "CHaAI" },
  { src: "./images/partners/emge-logo.png", alt: "EMGE" },
  { src: "./images/partners/pfizer.png", alt: "pfizer" },
  { src: "./images/partners/wwcv.png", alt: "wwcv" },
  { src: "./images/partners/bioson.jpg", alt: "BIOSCON" },
  { src: "./images/partners/mylan.jpg", alt: "MYLAN" },
  { src: "./images/partners/roche.jpg", alt: "ROCHE" },
  { src: "./images/partners/chi-pharma.jpg", alt: "Chi pharma" },
  { src: "./images/partners/dozie-and-dozie.jpg", alt: "Dozie and dozie" },
  { src: "./images/partners/novartis-logo.svg", alt: "Novartis" },
];

const featuredImage = "./images/partners/FMOH-Logo.png";

const ImageGallery = () => {
  return (
    <div className="container">
      <div
        className="toast mt-4 mb-4"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-body">
          <div className="mb-2">
            <h3 className="text-center">Partners:</h3>
          </div>
          <div className="mt-4 row d-flex align-items-center justify-content-center">
            <div className="col-md-3"></div>
            <div className="col-md-6 d-flex align-items-center justify-content-center" >
              <img
                src={featuredImage}
                alt="Federal ministry of health"
                className="gallery-top-image"
              />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="p-3 gallery">
            {partnersImages.map((image) => {
              return (
                <div className="gallery-image" key={image.alt}>
                  <img src={image.src} alt={image.alt} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
