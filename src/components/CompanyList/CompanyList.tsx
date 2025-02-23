import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import css from './CompanyList.module.scss';
import { Pagination } from '@mui/material';

function CompanyList() {
  const URI = process.env.REACT_APP_BACK_URL;
  const PORT = process.env.REACT_APP_BACK_DEFAULT_PORT;
  const [companyCard, setCompanyCard] = useState([]);
  const [currPage, setCurrPage] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryText, setCategoryText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAccess, setIsAccess] = useState(false);
  const [isWrite, setIsWrite] = useState(false);
  const [hasWrite, setHasWrite] = useState('');
  const [locationList, setLocationList] = useState([]);
  let token = localStorage.getItem('token');
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('Content-Type', 'application/json');
  if (token) {
    requestHeaders.set('Authorization', token);
  }
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://` + URI + `:` + PORT + `/feedlist?page=${currPage}`, {
      method: 'GET',
      headers: requestHeaders,
    })
      .then(response => response.json())
      .then(json => {
        setTotalPages(Number(json.resultPageCnt));
        setCompanyCard(json.resResult);
      });
  }, [currPage]);
  const handlePagination = (e: React.ChangeEvent<any>) => {
    setCurrPage(e.target.textContent);
  };

  useEffect(() => {
    fetch('http://' + URI + ':' + PORT + '/category')
      .then(res => res.json())
      .then(result => setCategoryList(result));
  }, []);

  useEffect(() => {
    fetch('http://' + URI + ':' + PORT + '/user/checkauth', {
      headers: requestHeaders,
    })
      .then(res => res.json())
      .then(result => {
        setIsAccess(result.write_permission);
        setIsWrite(result.group_feed_exist);
        setHasWrite(result.feed_id);
      });
  });

  const handleLocation = (e: React.MouseEvent<HTMLElement>) => {
    const location = e.currentTarget;
    navigate(`?location_id=${location.id}`);
    fetch(
      `http://` + URI + `:` + PORT + `/feedlist?location_id=${location.id}`,
      {
        headers: requestHeaders,
      }
    )
      .then(res => res.json())
      .then(result => {
        setTotalPages(0);
        setCompanyCard(result.result);
      });
    const target = e.target as Element;
    setLocationText(target.innerHTML);
  };

  const handleCategory = (e: React.MouseEvent<HTMLElement>) => {
    const category = e.currentTarget;
    navigate(`?category_id=${category.id}`);
    fetch(
      `http://` +
        URI +
        `:` +
        PORT +
        `/subhome/category?category_id=${category.id}`,
      {
        headers: requestHeaders,
      }
    )
      .then(res => res.json())
      .then(result => {
        setTotalPages(0);
        setCompanyCard(result);
      });
    const target = e.target as Element;
    setCategoryText(target.innerHTML);
  };

  useEffect(() => {
    fetch('http://' + URI + ':' + PORT + '/category/location')
      .then(res => res.json())
      .then(result => setLocationList(result));
  }, []);

  const moveDetail = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as Element;
    navigate(`/detail/${target.id}`);
  };

  const moveMyDetail = () => {
    navigate(`/detail/${hasWrite}`);
  };

  return (
    <>
      <div className={css.categoryList}>
        <div className={css.topTitle}>
          <h1 className={css.titleAll}>전체 보기</h1>
          {isAccess && (
            <button className={css.introduce}>
              {isWrite ? (
                <a className={css.myDetail} onClick={moveMyDetail}>
                  우리 회사 소개하기
                </a>
              ) : (
                <Link to="/postWritePage">우리 회사 소개하기</Link>
              )}
            </button>
          )}
        </div>
        <div className={css.buttonWrap}>
          <p>관심 있는 멤버를 찾아보세요!</p>
          <div className={css.cateTitle}>
            지역<span className={css.title}>{locationText}</span>
          </div>
          {locationList.map(({ id, location }) => (
            <button
              className={css.cateBtn}
              key={id}
              id={id}
              onClick={handleLocation}
            >
              {location}
            </button>
          ))}
          <div className={css.cateTitle}>
            카테고리<span className={css.title}>{categoryText}</span>
          </div>
          {categoryList.map(({ category_id, category }) => (
            <button
              className={css.cateBtn}
              key={category_id}
              id={category_id}
              onClick={handleCategory}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className={css.cardWrap}>
        {companyCard.map(
          ({ feed_id, logo_img, company_name, introduction, comment_cnt }) => (
            <div
              className={css.cardContainer}
              key={feed_id}
              id={feed_id}
              onClick={moveDetail}
            >
              <div className={css.imageContainer}>
                <img
                  className={css.cardImage}
                  src={logo_img}
                  alt="회사 이미지"
                />
              </div>
              <div className={css.contentContainer}>
                <div className={css.commentWrapper}>
                  <p className={css.companyName}>{company_name}</p>
                  <p className={css.commentCnt}>댓글 ({comment_cnt})</p>
                </div>
                <p className={css.companyDesc}>{introduction}</p>
              </div>
            </div>
          )
        )}
      </div>
      {totalPages !== 0 && (
        <Pagination
          className={css.pagination}
          count={totalPages}
          onChange={handlePagination}
        />
      )}
    </>
  );
}

export default CompanyList;
