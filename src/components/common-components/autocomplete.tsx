import React, { useState } from "react";
import { Show } from "../../utils/interfaces";
import { useHistory } from "react-router-dom";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

type Props = {
  list: Array<Show>;
  filterList: (text: string) => void;
};

export default function AutoComplete({ filterList }: Props) {
  const [] = useState();

  const handleKeyUp = (e: any) => {
    if (e.keyCode === 13) {
      nprogress.start();
      filterList(e.target.value.toLowerCase());
    }
  };

  const handleChange = (e: any) => {
    console.log(e.target.value);
    if (!e.target.value || e.target.value.length === 0) {
      nprogress.start();
      filterList("");
    }
  };

  return (
    <div className="search-container">
      <SearchRoundedIcon />
      <input
        type="text"
        className="search-input"
        placeholder="Find shows"
        onKeyUp={handleKeyUp}
        onChange={handleChange}
      />
    </div>
    // <Autocomplete
    //   id="virtualize-demo"
    //   style={{
    //     width: "100%",
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     height: 50,
    //     marginBottom: 5,
    //   }}
    //   size="small"
    //   disableListWrap
    //   ListboxComponent={ListboxComponent as any}
    //   value={value}
    //   onChange={(e, v) => {
    //     if (v) history.replace("/watch/" + v.id);
    //   }}
    //   options={list}
    //   getOptionLabel={(option) => option.name}
    //   renderInput={(params) => (
    //     <div ref={params.InputProps.ref}>
    //       <input
    //         placeholder="Search titles..."
    //         style={{
    //           width: "50vw",
    //           height: "50px",
    //           fontSize: "18px",
    //           fontWeight: "bold",
    //           backgroundColor: "transparent",
    //           paddingLeft: 30,
    //           border: "none",
    //         }}
    //         type="text"
    //         {...params.inputProps}
    //       />
    //     </div>
    //   )}
    //   renderOption={(option, { inputValue }) => {
    //     const matches = match(option.name, inputValue);
    //     const parts = parse(option.name, matches);
    //     return (
    //       <div
    //         style={{
    //           marginLeft: 20,
    //           width: "100%",
    //           height: 200,
    //           display: "grid",
    //           gridTemplateColumns: "300px auto",
    //         }}
    //       >
    //         <img
    //           src={getLink(option.banner)}
    //           alt="banner"
    //           style={{ width: "100%", height: "inherit", objectFit: "cover" }}
    //         />
    //         <div>
    //           {parts.map((part, index) => (
    //             <span
    //               key={index}
    //               style={{
    //                 fontWeight: part.highlight ? 700 : 400,
    //                 color: part.highlight ? "#11cb5f" : "inherit",
    //                 textDecoration: part.highlight ? "underline" : "none",
    //               }}
    //             >
    //               {part.text}
    //             </span>
    //           ))}
    //           <span>{option.desc}</span>
    //         </div>
    //         <Divider />
    //       </div>
    //     );
    //   }}
    // />
  );
}
