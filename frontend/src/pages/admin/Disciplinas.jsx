import { useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import {
  alterarStatusDisciplina,
  atualizarDisciplina,
  criarDisciplina,
  listarDisciplinas,
  removerDisciplina,
} from '../../api/disciplinas';
import { listarCursos } from '../../api/cursos';
import CrudPage from './CrudPage';

export default function Disciplinas() {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    listarCursos({ ativo: true })
      .then(setCursos)
      .catch(() => setCursos([]));
  }, []);

  const cursosMapa = Object.fromEntries(cursos.map((c) => [c.id, c.nome]));

  const campos = [
    { name: 'nome', label: 'Nome', required: true },
    { name: 'codigo', label: 'Código', required: true },
    { name: 'cargaHoraria', label: 'Carga horária', type: 'number', required: true, inputProps: { min: 1 } },
    {
      name: 'cursoId',
      label: 'Curso',
      type: 'select',
      required: true,
      options: cursos.map((c) => ({ value: c.id, label: c.nome })),
    },
  ];

  return (
    <CrudPage
      title="Disciplinas"
      newLabel="Nova disciplina"
      emptyMessage="Nenhuma disciplina cadastrada."
      fetchList={() => listarDisciplinas()}
      fields={campos}
      initialValues={{ nome: '', codigo: '', cargaHoraria: '', cursoId: '' }}
      getFormValues={(row) => ({
        nome: row.nome || '',
        codigo: row.codigo || '',
        cargaHoraria: row.cargaHoraria ?? '',
        cursoId: row.cursoId || '',
      })}
      transformPayload={(v) => ({ ...v, cargaHoraria: Number(v.cargaHoraria) })}
      onCreate={criarDisciplina}
      onUpdate={atualizarDisciplina}
      onToggleStatus={(row) => alterarStatusDisciplina(row.id, !row.ativo)}
      onRemove={removerDisciplina}
      getItemLabel={(row) => row.nome}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'codigo', label: 'Código' },
        { key: 'cargaHoraria', label: 'Carga horária' },
        { key: 'cursoId', label: 'Curso', render: (r) => cursosMapa[r.cursoId] || r.cursoId },
        {
          key: 'ativo',
          label: 'Status',
          render: (r) => (
            <Chip label={r.ativo ? 'Ativo' : 'Inativo'} color={r.ativo ? 'success' : 'default'} size="small" />
          ),
        },
      ]}
    />
  );
}
