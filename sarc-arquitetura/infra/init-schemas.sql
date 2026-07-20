-- Schemas e usuários por serviço (ADR-005)
CREATE SCHEMA IF NOT EXISTS usuario;      CREATE USER svc_usuario     PASSWORD 'svc_usuario';
CREATE SCHEMA IF NOT EXISTS espaco;       CREATE USER svc_espaco      PASSWORD 'svc_espaco';
CREATE SCHEMA IF NOT EXISTS equipamento;  CREATE USER svc_equipamento PASSWORD 'svc_equipamento';
CREATE SCHEMA IF NOT EXISTS reserva;      CREATE USER svc_reserva     PASSWORD 'svc_reserva';
GRANT ALL ON SCHEMA usuario     TO svc_usuario;
GRANT ALL ON SCHEMA espaco      TO svc_espaco;
GRANT ALL ON SCHEMA equipamento TO svc_equipamento;
GRANT ALL ON SCHEMA reserva     TO svc_reserva;
