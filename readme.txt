LƯU Ý:  
    + Khi dùng docker compose up -d --scale api=3 thì ta có thể điều chỉnh số lượng replicas 
    + nhưng nginx sẽ không ghi nhận số lượng tăng, giảm, do đó ta phải reload lại cả nginx 
    + hoặc restart lại nó luôn cũng được: docker compose restart balancer


- Trên một host ta không thể chạy nhiều container từ một image với port mapping giống nhau được
- Ví dụ một web app chạy cổng 8080 ở nội bộ, khi chạy trên một container, ta có thể map cổng như sau: -p 8080:8080
    + nhưng nếu chạy nhiều container từ image này, ta không thể đặt name giống nhau và thiết lập -p 8080:8080 cho các container như vậy
- Lúc đó ta phải thiết lập port khác nhau cho các container, ví dụ:
    + 8080:8080 cho container số 1
    + 8081:8080 cho container số 2
    + 8082:8080 cho container số 3
    + làm cách này có hoạt động nhưng chắc chắn không hiệu quả vì không scale dynamically được

- Cách làm tốt hơn đó là dùng docker-compose
    + để dễ dàng thiết lập số lượng replicas 
    + mỗi replica sẽ không expose port mà chỉ dùng port nội bộ riêng của nó là 8080
    + chúng được đặt cùng tên service, ví dụ service tên là api 
    + sau đó dùng nginx để map port với máy host, máy host khi truy cập sẽ vào nginx rồi nginx sẽ dùng reverse proxy để load balance giữa các replicas này.
    + về mặt lý thuyết thì không cần dùng nginx, chỉ cần một container khác ví dụ curlimages khi tham gia cùng network, truy cập tới http://api:8080 sẽ tự khắc sẽ được docker network load balance giữa các instance.


Cần lưu ý là khi test bằng chrome, ta sẽ không thấy hoạt động của round robin load balancer
Nếu test bằng curl ta sẽ thấy tác dụng. Chưa biết tại sao chrome bị như vậy nhưng nếu sử dụng cloudflared tunnel để bổ sung https thì round robin sẽ hoạt động bình thường


---

docker run -d \
  --name mysql-server \
  -e MYSQL_ROOT_PASSWORD=SuperSecretRootPwd \
  -e MYSQL_DATABASE=products_db \
  -e MYSQL_USER=mvmanh \
  -e MYSQL_PASSWORD=mvmanh@123456 \
  -p 3306:3306 \
  mysql:8.0


mysql -h 127.0.0.1 -u root -p products_db < init_products.sql