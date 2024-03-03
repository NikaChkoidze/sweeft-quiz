import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import style from "./index.module.css";

const APIURL = "https://api.unsplash.com/search/photos"; // სერჩის URL
const APIURLRANDOM = "https://api.unsplash.com/photos/random"; // რანდომის URL - როგორც ვნახე unsplash -ს popular ფუნქცია აღარ აქვს, ამიტომ გადავწყვიტე თავდაპირველად 20 რანდომ ფოტო გამოვიტანო.
const APIKEY = "U9FhSkMCXFAaq-GQe-swx0P5ga-ZamGoVZQlR02nxYw"; // არ დავმალე რადგან გამოჩენილიყო (რეალურ პროექტში env - ში დავმალავდი, ან სადმე სხვაგან).

function Main() {
  const [SearchValue, SetSearchValue] = useState("");
  const [PageNumber, SetPageNumber] = useState(1);
  const [Images, SetImages] = useState([]);
  const [Loading, SetLoading] = useState(false);
  const [OldSearchValue, SetOldSearchValue] = useState(false);

  const ScrollEnd = useRef(null);  // loading ref
  const AutoScroll = useRef(null); // autoscroll to top სიტყვის ცვლილებისას

  const HistorySearchedWords = JSON.parse( // დამახსოვრებული სიტყვები
    localStorage.getItem("SEARCHED_WORDS") || "[]"
  );

  const handleInputChange = (event) => {
    SetOldSearchValue(true);
    setTimeout(() => {
      SetOldSearchValue(false);
    }, 500);
    SetSearchValue(event.target.value);
  };

  useEffect(() => {

    const timeoutId = setTimeout(() => {
      const GetImages = async () => {
        try {

          const { data } = await axios.get(`${SearchValue === "" ? APIURLRANDOM : APIURL}?query=${SearchValue}&order_by=${"popular"}&page=${PageNumber}&client_id=${APIKEY}&count=20`);

          if (SearchValue === "") {
            SetImages(data);
            SetLoading(false);
            SetPageNumber(1);
          } else {
            if (OldSearchValue === false) {
              SetImages((Images) => [...Images, ...data.results]);
            }
            else {
              AutoScroll.current.scrollTo({ top: 0 });
              SetImages(data.results);
              HistorySearchedWords.push(SearchValue);
              window.localStorage.setItem("SEARCHED_WORDS",JSON.stringify(HistorySearchedWords));
              SetPageNumber(1);
            }
            SetLoading(true);
          }
        } catch (error) {
          console.log(error);
        }
      };

      GetImages();
    }, 500);

    return () => clearTimeout(timeoutId);

  }, [SearchValue, PageNumber]);

  useEffect(() => {
    if (Loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            SetPageNumber((prevPageNumber) => prevPageNumber + 1);
          }
        },
        { threshold: 1 }
      );
      observer.observe(ScrollEnd.current);
    }
  }, [Loading]);

  const ListImages = Images.map((i, index) => (
      <img
        className={style.container_item}
        key={index} // key შემეძლო მეხმარა i.id , მაგრამ რატომღაც api-ს ზოგ ფოტოზე ერთიდაიგივე id აქვთ, ამიტომ ვიხმარე index
        src={i.urls.small}
        alt={i.alt_description}
      ></img>)
  );

  return (
    <div className={style.main}>
      <input type="text" onChange={(event) => handleInputChange(event)} placeholder="Search..." className={style.search}></input>
      <div className={style.container} ref={AutoScroll}>
        {ListImages}
        {Loading === true ? (
          <div ref={ScrollEnd} className={style.loading_outer}>
            <div className={style.loading_middle}>
              <div className={style.loading_inner}></div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Main;
