import IRequest from "../Models/IRequest";

const removeHeadersFilter = (req: IRequest) => {
  delete req.headers.originalurl;
  delete req.headers.host;
  delete req.headers["content-length"];
  delete req.headers["content-type"];
  delete req.headers["user-agent"];
  delete req.headers["accept"];
  delete req.headers["postman-token"];
  delete req.headers["accept-encoding"];
  delete req.headers["connection"];
  delete req.headers["cache-control"];
  delete req.headers["origin"];
  delete req.headers["sec-fetch-mode"];
  delete req.headers["sec-fetch-site"];
  delete req.headers["sec-fetch-dest"];
  delete req.headers["referer"];
  delete req.headers["accept-encoding"];
  delete req.headers["accept-language"];
  delete req.headers["cookie"];
  delete req.headers["pragma"];
  delete req.headers["upgrade-insecure-requests"];
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];
  delete req.headers["if-match"];
  delete req.headers["if-range"];
};

export default removeHeadersFilter;
