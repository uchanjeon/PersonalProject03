export default function (err, req, res, next) {
  // 에러를 출력합니다.
  console.error(err);

  // 클라이언트에게 에러 메시지를 전달
  res.status(500).json({ errorMessage: err.message });
  // 클라이언트에게 에러 메세지를 한가지 방식으로만 전달
  // res.status(500).json({ errorMessage: '서버 내부 에러가 발생했습니다.' });
}
