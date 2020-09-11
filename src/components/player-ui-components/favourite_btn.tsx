import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@material-ui/icons/FavoriteBorderRounded";

type Props = {
  favourited: boolean;
  addToFavourites: () => void;
};

function FavouriteBtn({ favourited, addToFavourites }: Props) {
  const handleClick = (e: any) => addToFavourites();

  const Button = (favourited: boolean) => {
    return favourited ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />;
  };

  return (
    <IconButton aria-label="Add to favourites" onClick={handleClick}>
      {Button(favourited)}
    </IconButton>
  );
}

export default memo(FavouriteBtn);
