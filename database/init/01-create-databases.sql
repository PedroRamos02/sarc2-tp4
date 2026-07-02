-- Executado automaticamente pelo container MySQL no primeiro boot
-- (arquivos em /docker-entrypoint-initdb.d são rodados em ordem alfabética).
-- O usuário de aplicação (MYSQL_USER) já existe neste ponto, criado pelo
-- próprio entrypoint da imagem oficial a partir das variáveis de ambiente.

CREATE DATABASE IF NOT EXISTS auth_db        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS professor_db   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sala_db        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS equipamento_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS reserva_db     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON auth_db.*        TO 'sarc2'@'%';
GRANT ALL PRIVILEGES ON professor_db.*   TO 'sarc2'@'%';
GRANT ALL PRIVILEGES ON sala_db.*        TO 'sarc2'@'%';
GRANT ALL PRIVILEGES ON equipamento_db.* TO 'sarc2'@'%';
GRANT ALL PRIVILEGES ON reserva_db.*     TO 'sarc2'@'%';

FLUSH PRIVILEGES;
