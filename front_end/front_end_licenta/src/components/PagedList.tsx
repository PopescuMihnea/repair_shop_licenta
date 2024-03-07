import { useParams, useSearchParams } from "react-router-dom";
import { IPagedListComponent } from "../interfaces/pagedList/IPagedListComponent";
import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { IPagedList } from "../interfaces/pagedList/IPagedList";
import { useFormik } from "formik";
import { ISearchValues } from "../interfaces/pagedList/ISearchValues";
import { counties } from "../consts";
import { FormattedMessage } from "react-intl";
import { useLanguageContextMessages } from "../context/language";

const PagedList: React.FC<IPagedListComponent> = ({
  searchOptions,
  filterOptions,
  searchByLocation,
  resourceType,
  resourceUri,
  useIdForResource,
  createNewUri,
  grid,
  canCreate,
  useIdForCreate,
  isManager,
  DataCard,
}) => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [lastSearchValues, setLastSearchValues] = useState<ISearchValues>();
  const [searchParams, _] = useSearchParams();
  const queryString = window.location.search;
  const [pagedList, setPagedList] = useState<IPagedList<any> | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const { id } = useParams();
  const languageContext: any = useLanguageContextMessages().language;

  useEffect(() => {
    const getData = async (): Promise<void> => {
      try {
        const url = `${backendUri}/${resourceUri}${
          useIdForResource ? `/${id}` : ""
        }${queryString}`;

        console.log("url", url);

        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const pagedListRes: IPagedList<any> = await res.json();
          setPagedList(pagedListRes);

          console.log(pagedListRes);
        } else if (res.status === 404) {
          console.error(404);
        } else if (res.status === 500) {
          console.error(500);
        } else if (res.status === 403) {
          setForbidden(true);
        }
      } catch (error) {
        console.error(`Error fetching ${resourceType}`, error);
      }
    };

    getData();
    let obj = {} as Record<string, string>;
    const lastSearchValues: ISearchValues = {
      filterInput: "",
      filterType: searchOptions[0].value,
      sortInput: filterOptions[0].value,
      sortType: "desc",
      perPage: "5",
    };

    try {
      obj = JSON.parse(searchParams.get("filter")!);
      let keys = Object.keys(obj);
      /*console.log("keys: ", keys);
      console.log(obj);*/
      if (keys.length > 0) {
        //console.log("keys");
        values.filterType = keys[0];
        lastSearchValues.filterType = keys[0];
        if (obj[keys[0]] !== "") {
          values.filterInput = obj[keys[0]];
          lastSearchValues.filterInput = obj[keys[0]];
        }

        if (searchByLocation) {
          if (obj["street"]) {
            values.street = obj["street"];
            lastSearchValues.street = obj["street"];
          }

          if (obj["city"]) {
            values.city = obj["city"];
            lastSearchValues.city = obj["city"];
          }

          lastSearchValues.county = counties[0];
          if (obj["county"]) {
            values.county = obj["county"];
            lastSearchValues.county = obj["county"];
          }
        }
      }
    } catch (err) {}

    try {
      obj = JSON.parse(searchParams.get("sort")!);
      let keys = Object.keys(obj);
      if (keys.length > 0) {
        values.sortInput = keys[0];
        lastSearchValues.sortInput = keys[0];
        if (obj[keys[0]] !== "") {
          values.sortType = obj[keys[0]];
          lastSearchValues.sortType = obj[keys[0]];
        }
      }
    } catch (err) {}

    try {
      const perPage = searchParams.get("perPage");
      if (perPage) {
        values.perPage = perPage;
        lastSearchValues.perPage = perPage;
      }
    } catch (err) {}
    /*console.log("values init: ", values);
    console.log("last search values init: ", lastSearchValues);*/
    setLastSearchValues(lastSearchValues);
  }, [backendUri, resourceUri, useIdForResource]);

  /*if (pagedList) {
    console.log(pagedList);

    if (pagedList.data) {
      pagedList.data.forEach((elem) => console.log(elem));
    }
  }*/

  const {
    values,
    submitForm,
    handleBlur,
    handleChange,
    handleSubmit,
    setSubmitting,
  } = useFormik({
    initialValues: {
      filterInput: "",
      filterType: searchOptions[0].value,
      sortInput: filterOptions[0].value,
      sortType: "desc",
      perPage: "5",
      street: "",
      city: "",
      county: "",
    },
    onSubmit: (values) => {
      setSubmitting(true);
      const filter = {} as Record<string, string>;
      filter[values.filterType] = values.filterInput;
      if (searchByLocation) {
        filter["street"] = values.street;
        filter["city"] = values.city;
        filter["county"] = values.county;
      }
      const filterJson = JSON.stringify(filter);

      const sort = {} as Record<string, string>;
      sort[values.sortInput] = values.sortType;
      const sortJson = JSON.stringify(sort);

      const perPage = values.perPage;
      const page = pagedList ? pagedList.page : 1;
      const queryString = `?filter=${filterJson}&sort=${sortJson}&perPage=${perPage}&page=${page}`;

      //console.log(queryString);

      window.location.replace(
        window.location.origin + window.location.pathname + queryString
      );
    },
  });

  const handleButtonClick = useCallback(() => {
    setShowForm(!showForm);
  }, [showForm]);

  const handlePageButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const buttonText: string = event.currentTarget.innerText;
      if (buttonText === languageContext["app.next"]) {
        pagedList!.page = pagedList!.page + 1;
      } else if (buttonText === languageContext["app.previous"]) {
        pagedList!.page = pagedList!.page - 1;
      } else {
        pagedList!.page = parseInt(buttonText);
      }

      if (lastSearchValues) {
        values.filterInput = lastSearchValues.filterInput;
        values.filterType = lastSearchValues.filterType;
        values.sortInput = lastSearchValues.sortInput;
        values.sortType = lastSearchValues.sortType;
        values.perPage = lastSearchValues.perPage;

        if (searchByLocation) {
          values.street = lastSearchValues.street!;
          values.city = lastSearchValues.city!;
          values.county = lastSearchValues.county!;
        }
      }

      submitForm();
    },
    [lastSearchValues, pagedList]
  );

  return (
    <div>
      {forbidden ? (
        <p className="m-5">
          <FormattedMessage id="app.notAllowed" defaultMessage="Not allowed" />
        </p>
      ) : (
        <>
          <button
            type="button"
            className={showForm ? "btn btn-danger m-3" : "btn btn-success m-3"}
            onClick={handleButtonClick}
          >
            {!showForm ? (
              <FormattedMessage
                id="app.hideFilter"
                defaultMessage="Hide filters"
              />
            ) : (
              <FormattedMessage
                id="app.showFilter"
                defaultMessage="Show filters"
              />
            )}
          </button>
          {showForm && (
            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="filterInput" className="form-label">
                    <FormattedMessage id="app.search" defaultMessage="Search" />
                  </label>
                  <div className="row">
                    <div className="col-8">
                      <input
                        type="text"
                        className="form-control"
                        id="filterInput"
                        value={values.filterInput}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="col-2">
                      <select
                        className="form-select"
                        id="filterType"
                        value={values.filterType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {searchOptions.map((option) => (
                          <option key={option.key} value={option.value}>
                            <FormattedMessage
                              id={`${option.key}`}
                              defaultMessage={`${option.key}`}
                            />
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-2">
                      <button type="submit" className="btn btn-primary">
                        <FormattedMessage
                          id="app.applyFilter"
                          defaultMessage="Apply Filter"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="sortInput" className="form-label">
                    <FormattedMessage id="app.sort" defaultMessage="Sort" />
                  </label>
                  <div className="row">
                    <div className="col-6">
                      <select
                        className="form-select"
                        id="sortInput"
                        value={values.sortInput}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {filterOptions.map((option) => (
                          <option key={option.key} value={option.value}>
                            <FormattedMessage
                              id={`${option.key}`}
                              defaultMessage={`${option.key}`}
                            />
                          </option>
                        ))}
                        <option value="">
                          <FormattedMessage
                            id="app.none"
                            defaultMessage="None"
                          />
                        </option>
                      </select>
                    </div>
                    <div className="col-2">
                      <select
                        className="form-select"
                        id="sortType"
                        value={values.sortType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={
                          values.sortInput === ""
                            ? { backgroundColor: "#cccccc" }
                            : {}
                        }
                        disabled={values.sortInput === ""}
                      >
                        <option value="asc">
                          <FormattedMessage
                            id="app.ascending"
                            defaultMessage="Ascending"
                          />
                        </option>
                        <option value="desc">
                          <FormattedMessage
                            id="app.descending"
                            defaultMessage="Descending"
                          />
                        </option>
                      </select>
                    </div>
                    <div className="col-2">
                      <div className="d-flex">
                        <select
                          className="form-select"
                          id="perPage"
                          value={values.perPage}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="5">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="5 per page"
                              values={{ nrPages: 5 }}
                            />
                          </option>
                          <option value="10">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="10 per page"
                              values={{ nrPages: 10 }}
                            />
                          </option>
                          <option value="15">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="15 per page"
                              values={{ nrPages: 15 }}
                            />
                          </option>
                          <option value="25">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="25 per page"
                              values={{ nrPages: 25 }}
                            />
                          </option>
                          <option value="50">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="50 per page"
                              values={{ nrPages: 50 }}
                            />
                          </option>
                          <option value="100">
                            <FormattedMessage
                              id="app.perPage"
                              defaultMessage="100 per page"
                              values={{ nrPages: 100 }}
                            />
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="col-2">
                      {canCreate && (
                        <NavLink
                          to={`${createNewUri!}${
                            useIdForCreate ? `/${id}` : ""
                          }`}
                        >
                          <button type="button" className="btn btn-primary">
                            <FormattedMessage
                              id={`Create new ${resourceType}`}
                              defaultMessage={`Create new ${resourceType}`}
                            />
                          </button>
                        </NavLink>
                      )}
                    </div>
                  </div>
                </div>
                {searchByLocation && (
                  <>
                    <div className="row">
                      <div className="col-4">
                        <label htmlFor="street" className="form-label">
                          <FormattedMessage
                            id="app.street"
                            defaultMessage="Street"
                          />
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="street"
                          value={values.street}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="col-4">
                        <label htmlFor="city" className="form-label">
                          <FormattedMessage
                            id="app.city"
                            defaultMessage="City"
                          />
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          value={values.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="col-4">
                        <label htmlFor="county" className="form-label">
                          <FormattedMessage
                            id="app.county"
                            defaultMessage="County"
                          />
                        </label>
                        <select
                          className="form-select"
                          id="county"
                          value={values.county}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="">
                            <FormattedMessage
                              id="app.none"
                              defaultMessage="None"
                            />
                          </option>
                          {counties.map((county, index) => {
                            return (
                              <option value={county} key={index}>
                                {county}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
          <div>
            <div className={grid ? "row mt-4" : "mt-4"}>
              {!pagedList && <h5 className="m-5">Loading...</h5>}
              {pagedList &&
                pagedList.data.map((element) => (
                  <div
                    key={element._id}
                    className={
                      grid ? "col-md-4 col-sm-6 col-8 mb-2 text-center" : "mb-2"
                    }
                  >
                    {useIdForResource ? (
                      <DataCard
                        data={element}
                        queryString={queryString}
                        resourceId={id}
                        isManager={isManager}
                      />
                    ) : (
                      <DataCard
                        data={element}
                        queryString={queryString}
                        isManager={isManager}
                      />
                    )}
                  </div>
                ))}
              {pagedList && pagedList.data.length === 0 && (
                <h5 className="m-5">
                  <FormattedMessage
                    id="app.noData"
                    defaultMessage="No data found with these filters or no data exists"
                  />
                </h5>
              )}
            </div>
          </div>

          {pagedList && (
            <div className="d-flex justify-content-center mt-4">
              <ul className="pagination ">
                <li className="page-item">
                  <button
                    className={
                      pagedList!.page > 1 ? "page-link" : "page-link disabled"
                    }
                    onClick={handlePageButtonClick}
                  >
                    <FormattedMessage
                      id="app.previous"
                      defaultMessage="Previous"
                    />
                  </button>
                </li>
                <li className="page-item">
                  <button
                    className={
                      1 !== pagedList.page ? "page-link" : "page-link active"
                    }
                    onClick={handlePageButtonClick}
                  >
                    1
                  </button>
                </li>
                {pagedList.pages >= 2 && (
                  <li className="page-item">
                    <button
                      className={
                        2 !== pagedList.page ? "page-link" : "page-link active"
                      }
                      onClick={handlePageButtonClick}
                    >
                      2
                    </button>
                  </li>
                )}
                {pagedList.pages >= 3 && (
                  <li className="page-item">
                    <button
                      className={
                        3 !== pagedList.page ? "page-link" : "page-link active"
                      }
                      onClick={handlePageButtonClick}
                    >
                      3
                    </button>
                  </li>
                )}
                {pagedList.pages >= 7 && pagedList.page > 7 && (
                  <li className="page-item">
                    <button className="page-link disabled">...</button>
                  </li>
                )}
                {pagedList.page >= 7 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page - 3}
                    </button>
                  </li>
                )}
                {pagedList.page >= 6 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page - 2}
                    </button>
                  </li>
                )}
                {pagedList.page >= 5 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page - 1}
                    </button>
                  </li>
                )}
                {pagedList.page > 3 &&
                  pagedList.page <= pagedList.pages - 3 && (
                    <li className="page-item">
                      <a className="page-link active" href="#">
                        {pagedList.page}
                      </a>
                    </li>
                  )}
                {pagedList.page <= pagedList.pages - 4 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page + 1}
                    </button>
                  </li>
                )}
                {pagedList.page <= pagedList.pages - 5 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page + 2}
                    </button>
                  </li>
                )}
                {pagedList.page <= pagedList.pages - 6 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.page + 3}
                    </button>
                  </li>
                )}
                {pagedList.pages >= 7 &&
                  ((pagedList.page > 3 &&
                    pagedList.page < pagedList.pages - 7) ||
                    pagedList.page <= 3) && (
                    <li className="page-item">
                      <a className="page-link disabled" href="#">
                        ...
                      </a>
                    </li>
                  )}
                {pagedList.pages >= 6 && (
                  <li className="page-item">
                    <button
                      className={
                        pagedList.pages - 2 !== pagedList.page
                          ? "page-link"
                          : "page-link active"
                      }
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.pages - 2}
                    </button>
                  </li>
                )}
                {pagedList.pages >= 5 && (
                  <li className="page-item">
                    <button
                      className={
                        pagedList.pages - 1 !== pagedList.page
                          ? "page-link"
                          : "page-link active"
                      }
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.pages - 1}
                    </button>
                  </li>
                )}
                {pagedList.pages >= 4 && (
                  <li className="page-item">
                    <button
                      className={
                        pagedList.pages !== pagedList.page
                          ? "page-link"
                          : "page-link active"
                      }
                      onClick={handlePageButtonClick}
                    >
                      {pagedList.pages}
                    </button>
                  </li>
                )}
                <li className="page-item">
                  <button
                    className={
                      pagedList!.page < pagedList!.pages
                        ? "page-link"
                        : "page-link disabled"
                    }
                    onClick={handlePageButtonClick}
                  >
                    <FormattedMessage id="app.next" defaultMessage="Next" />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PagedList;
