import { Chip } from '@mui/material';
import { alterarStatusCurso, atualizarCurso, criarCurso, listarCursos, removerCurso } from '../../api/cursos';
import CrudPage from './CrudPage';

const CAMPOS = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'codigo', label: 'Código', required: true },
];

export default function Cursos() {
  return (
    <CrudPage
      title="Cursos"
      newLabel="Novo curso"
      emptyMessage="Nenhum curso cadastrado."
      fetchList={() => listarCursos()}
      fields={CAMPOS}
      initialValues={{ nome: '', codigo: '' }}
      getFormValues={(row) => ({ nome: row.nome || '', codigo: row.codigo || '' })}
      onCreate={criarCurso}
      onUpdate={atualizarCurso}
      onToggleStatus={(row) => alterarStatusCurso(row.id, !row.ativo)}
      onRemove={removerCurso}
      getItemLabel={(row) => row.nome}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'codigo', label: 'Código' },
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
