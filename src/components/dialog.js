import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import LockOpenIcon from "@material-ui/icons/LockOpen";

export default function ResponsiveDialog(props) {
  const [open, setOpen] = React.useState(props.open);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = (e) => {
    if (window.desktop) window.shell.openExternal(props.url);
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Authentication required!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Drive Stream needs to be authenticated with Google Drive in order to
            stream videos. Press the "Authenticate" button to authenticate this
            app with Google Drive.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            startIcon={<LockOpenIcon />}
          >
            Authenticate
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
