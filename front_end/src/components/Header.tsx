import { useEthers } from "@usedapp/core";
import Button from "@mui/material/Button";
import { styled } from "@mui/system";
import Typography from "@mui/material/Typography";

const HeaderContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const Header = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();

  const isConnected = account !== undefined;

  return (
    <HeaderContainer>
      {isConnected && (
        <Typography style={{ color: "white" }}>
          Connected Account: {account}
        </Typography>
      )}
      <div>
        {isConnected ? (
          <Button variant="contained" color="primary" onClick={deactivate}>
            Disconnect
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={() => activateBrowserWallet()}>
            Connect
          </Button>
        )}
      </div>
    </HeaderContainer>
  );
};
