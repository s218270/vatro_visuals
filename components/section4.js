export default function Section4({ scrollToSection }) {
    return (
      <section
        id="section4"
        className="h-screen w-full bg-gray-500 flex flex-col items-center justify-center relative"
      >
        <div className="absolute z-20 flex gap-10 h-full w-[70%]">
          <img src="Andrew.webp" style={{ width: "30%", height: "50%" }} alt="Andrew" />
          <p className="text-xl text-white w-[40%]">
            Jestem Andrew Tate, były mistrz świata w kickboxingu, przedsiębiorca
            i twórca treści motywacyjnych. Znany z mojego pewnego siebie
            podejścia do życia i kontrowersyjnych poglądów, inspiruję ludzi, by
            dążyli do osiągnięcia sukcesu w każdej dziedzinie. Moje życie to
            połączenie dyscypliny, ciężkiej pracy i luksusu, które pokazuję, by
            motywować innych do wyjścia poza swoje granice.
          </p>
        </div>
  
        <button
          onClick={() => scrollToSection("section5")}
          className="absolute bottom-10 bg-black p-4 rounded-full hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </section>
    );
  }