-- CreateTable
CREATE TABLE `reservas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `disciplina_id` INTEGER NULL,
    `curso_id` INTEGER NULL,
    `turma` VARCHAR(50) NOT NULL,
    `professor_id` INTEGER NOT NULL,
    `espaco_id` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fim` VARCHAR(5) NOT NULL,
    `observacoes` VARCHAR(500) NULL,
    `status` ENUM('ATIVA', 'CANCELADA') NOT NULL DEFAULT 'ATIVA',
    `criado_por` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reservas_espaco_id_data_idx`(`espaco_id`, `data`),
    INDEX `reservas_professor_id_data_idx`(`professor_id`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva_equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reserva_id` INTEGER NOT NULL,
    `equipamento_id` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,

    INDEX `reserva_equipamentos_equipamento_id_idx`(`equipamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reserva_equipamentos` ADD CONSTRAINT `reserva_equipamentos_reserva_id_fkey` FOREIGN KEY (`reserva_id`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
