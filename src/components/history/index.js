import React, { useState, useRef, useEffect } from "react";
import style from "./index.module.css";
import axios from "axios";
import { useInView } from "react-intersection-observer";

const APIURL = "https://api.unsplash.com/search/photos"; // სერჩ URL
const APIKEY = "U9FhSkMCXFAaq-GQe-swx0P5ga-ZamGoVZQlR02nxYw"; // არ დავმალე რადგან გამოჩენილიყო (რეალურ პროექტში env - ში დავმალავდი, ან სადმე სხვაგან).

function History() {

  const SearchedWordsAll = JSON.parse( // დასერჩილი სიტყვების ისტორია
    localStorage.getItem("SEARCHED_WORDS") || "[]"
  );
  const SearchedWords = Array.from(new Set(SearchedWordsAll)); // გაფილტრული სიტყვები დუბლიკატების გარეშე

  const [CurrentText, SetCurrentText] = useState("");
  const [Images, SetImages] = useState([]);
  const [PageNumber, SetPageNumber] = useState(1);

  const [IsModal, SetIsModal] = useState(false);
  const [IsModalImage, SetIsModalImage] = useState(false);
  const [OpenImage, SetOpenImage] = useState({});

  const { ref: ScrollEnd, inView: Loading } = useInView(); // მთავარ გვერდზე intersection-observer დავწერე დამოუკიდებელი ლოგიკით, ამიტომ აქ გამოვიყენე react-intersection-observer

  useEffect(() => {
    const GetImages = async () => {

      try {
        if (Loading) SetPageNumber((prevPageNumber) => prevPageNumber + 1);
        const { data } = await axios.get(`${APIURL}?query=${CurrentText}&order_by=${"popular"}&page=${PageNumber}&client_id=${APIKEY}`);
        SetImages((Images) => [...Images, ...data.results]);
      } catch (error) {
        console.log(error);
      }

    };

    GetImages();
  }, [IsModal, Loading]);

  function OpenModal(i) {
    SetIsModal(true);
    SetCurrentText(i);
  }

  function CloseModal() {
    SetIsModal(false);
    SetImages([]);
    SetPageNumber(1);
    SetCurrentText("");
    CloseImageModal();
  }

  function OpenImageModal(i) {
    SetIsModalImage(true);
    SetOpenImage({
      image: i.urls.regular,
      likes: i.likes,
      created: i.created_at, // views ინფორმაციას აღარ გვაწვდის unsplash api, ამიტომ რამე რომ გამომეტანა, გამოვიტანე შექმნის თარიღი.
      desc: i.description, // downloads ინფორმაციას აღარ გვაწვდის unsplash api, ამიტომ რამე რომ გამომეტანა, გამოვიტანე აღწერა.
    });
  }

  function CloseImageModal() {
    SetIsModalImage(false);
    SetOpenImage({});
  }

  const ListWords = SearchedWords.map((i, index) => (
    <div
      onClick={() => OpenModal(i)}
      key={index}
      className={style.history_item}
    >{i}</div>
  ));

  const ListImages = Images.map((i, index) => (
    <img
      key={index}
      onClick={() => OpenImageModal(i)}
      src={i.urls.small}
      alt={i.alt_description}
      className={style.modal_image_item}
    ></img>
  ));

  return (
    <div className={style.main}>
      {SearchedWords.length == 0 ? <div style={{color : "white"}}>ისტორია ცარიელია - განახორციელეთ რაიმე ძიება...</div> : null }
      {ListWords}
      {IsModal ? (
        <div className={style.modal_main}>
          <div className={style.modal_close} onClick={() => CloseModal()}>X</div>
          <div className={style.modal_searchedtext}>{CurrentText}</div>
          <div className={style.modal_image_container}>
            {ListImages}
            <div ref={ScrollEnd} className={style.loading_outer}>
              <div className={style.loading_middle}>
                <div className={style.loading_inner}></div>
              </div>
            </div>
            {IsModalImage ? (
              <div className={style.image_modal}>
                <img className={style.image_modal_image} src={OpenImage.image} alt="big img"></img>
                <ul className={style.image_modal_right}>
                  <li className={style.image_modal_right_item}>Likes: {OpenImage.likes}</li>
                  <li className={style.image_modal_right_item}>Date: {OpenImage.created}</li>
                  <li className={`${style.image_modal_right_item} ${style.image_modal_desc}`}> Description: {OpenImage.desc} </li>
                  <button className={style.image_modal_close}onClick={() => CloseImageModal()}>Go Back </button>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default History;
