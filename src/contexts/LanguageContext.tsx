import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  // Common UI
  save: { pt: 'Salvar', en: 'Save', es: 'Guardar' },
  cancel: { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' },
  edit: { pt: 'Editar', en: 'Edit', es: 'Editar' },
  delete: { pt: 'Excluir', en: 'Delete', es: 'Eliminar' },
  loading: { pt: 'Carregando...', en: 'Loading...', es: 'Cargando...' },
  success: { pt: 'Sucesso!', en: 'Success!', es: '¡Éxito!' },
  error: { pt: 'Erro!', en: 'Error!', es: '¡Error!' },
  back: { pt: 'Voltar', en: 'Back', es: 'Volver' },
  finish: { pt: 'Finalizar', en: 'Finish', es: 'Finalizar' },
  close: { pt: 'Fechar', en: 'Close', es: 'Cerrar' },
  all: { pt: 'Todas', en: 'All', es: 'Todas' },
  today: { pt: 'Hoje', en: 'Today', es: 'Hoy' },
  week: { pt: 'Semana', en: 'Week', es: 'Semana' },
  month: { pt: 'Mês', en: 'Month', es: 'Mes' },
  year: { pt: 'Ano', en: 'Year', es: 'Año' },
  you: { pt: 'Você', en: 'You', es: 'Tú' },
  attention: { pt: 'Atenção! 🛡️', en: 'Attention! 🛡️', es: '¡Atención! 🛡️' },
  locale: { pt: 'pt-BR', en: 'en-US', es: 'es-ES' },

  // Auth
  welcomeBack: { pt: 'Bem-vindo de volta, {user}! 🚀', en: 'Welcome back, {user}! 🚀', es: '¡Bienvenido de nuevo, {user}! 🚀' },
  readyForMission: { pt: 'Pronto para sua próxima missão? 🎯', en: 'Ready for your next mission? 🎯', es: '¿Listo para tu próxima misión? 🎯' },
  user: { pt: 'Usuário', en: 'User', es: 'Usuario' },
  password: { pt: 'Senha', en: 'Password', es: 'Contraseña' },
  forgotPassword: { pt: 'Esqueceu sua senha?', en: 'Forgot your password?', es: '¿Olvidaste tu contraseña?' },
  authenticating: { pt: 'Autenticando...', en: 'Authenticating...', es: 'Autenticando...' },
  enter: { pt: 'Entrar', en: 'Enter', es: 'Entrar' },
  newHere: { pt: 'Novo por aqui?', en: 'New here?', es: '¿Nuevo por aquí?' },
  createAccountNow: { pt: 'Crie sua conta agora!', en: 'Create your account now!', es: '¡Crea tu cuenta ahora!' },
  invalidCredentials: { pt: 'Credenciais inválidas. Tente novamente!', en: 'Invalid credentials. Try again!', es: '¡Credenciales inválidas. Intente de nuevo!' },
  passwordsDoNotMatch: { pt: 'Ops! As senhas não coincidem. Tente novamente! 🧐', en: 'Oops! Passwords do not match. Try again! 🧐', es: '¡Vaya! Las contraseñas no coinciden. ¡Inténtalo de nuevo! 🧐' },
  accountCreatedSuccess: { pt: 'Conta criada com sucesso! Agora você é um herói da produtividade! 🏆', en: 'Account created successfully! Now you are a productivity hero! 🏆', es: '¡Cuenta creada con éxito! ¡Ahora eres un héroe de la productividad! 🏆' },
  signupError: { pt: 'Erro ao criar conta. Verifique os dados e tente novamente.', en: 'Error creating account. Check the data and try again.', es: 'Error al crear la cuenta. Verifique los datos e intente de nuevo.' },
  newHero: { pt: 'Novo Herói', en: 'New Hero', es: 'Nuevo Héroe' },
  readyToMaster: { pt: 'Pronto para dominar suas tarefas? 🚀', en: 'Ready to master your tasks? 🚀', es: '¿Listo para dominar tus tareas? 🚀' },
  yourFullName: { pt: 'Seu Nome Completo', en: 'Your Full Name', es: 'Tu Nombre Completo' },
  contactEmail: { pt: 'E-mail de Contato', en: 'Contact Email', es: 'Correo de Contacto' },
  confirmPassword: { pt: 'Confirmar Senha', en: 'Confirm Password', es: 'Confirmar Contraseña' },
  creatingAccount: { pt: 'Criando Conta...', en: 'Creating Account...', es: 'Criando Cuenta...' },
  alreadyPart: { pt: 'Já faz parte da equipe?', en: 'Already part of the team?', es: '¿Ya eres parte del equipo?' },
  loginNow: { pt: 'Fazer login agora!', en: 'Log in now!', es: '¡Inicia sesión agora!' },
  recoveryInstructionsSent: { pt: 'Instruções enviadas para o e-mail associado a "{identifier}"! 📧', en: 'Instructions sent to the email associated with "{identifier}"! 📧', es: '¡Instrucciones enviadas al correo asociado a "{identifier}"! 📧' },
  genericError: { pt: 'Ocorreu um erro. Tente novamente mais tarde.', en: 'An error occurred. Please try again later.', es: 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.' },
  recoverPassword: { pt: 'Recuperar Senha', en: 'Recover Password', es: 'Recuperar Contraseña' },
  dontWorry: { pt: 'Não se preocupe, acontece com os melhores! 🦸‍♂️', en: "Don't worry, it happens to the best! 🦸‍♂️", es: '¡No te preocupes, les pasa a los mejores! 🦸‍♂️' },
  accountNotFound: { pt: 'Não encontramos seu cadastro.', en: 'Account not found.', es: 'No encontramos su registro.' },
  please: { pt: 'Por favor,', en: 'Please,', es: 'Por favor,' },
  createYourAccount: { pt: 'crie sua conta', en: 'create your account', es: 'cree su cuenta' },
  toStartJourney: { pt: ' para começar sua jornada!', en: ' to start your journey!', es: ' ¡para comenzar su jornada!' },
  tryAnotherUser: { pt: 'Tentar outro usuário/e-mail', en: 'Try another user/email', es: 'Intentar con otro usuario/correo' },
  emailOrUser: { pt: 'E-mail ou Usuário', en: 'Email or User', es: 'Correo o Usuario' },
  recoveryInstructionsDesc: { pt: 'Enviaremos as instruções de recuperação para o e-mail cadastrado.', en: 'We will send recovery instructions to the registered email.', es: 'Enviaremos las instrucciones de recuperación al correo registrado.' },
  verifying: { pt: 'Verificando...', en: 'Verifying...', es: 'Verificando...' },
  sendRecovery: { pt: 'Enviar Recuperação', en: 'Send Recovery', es: 'Enviar Recuperación' },
  backToLogin: { pt: 'Voltar para o Login', en: 'Back to Login', es: 'Volver al Login' },

  // Navigation
  dashboard: { pt: 'Dashboard', en: 'Dashboard', es: 'Dashboard' },
  tasks: { pt: 'Tarefas', en: 'Tasks', es: 'Tareas' },
  reports: { pt: 'Relatórios', en: 'Reports', es: 'Informes' },
  calendar: { pt: 'Calendário', en: 'Calendar', es: 'Calendario' },
  integrations: { pt: 'Integrações', en: 'Integrations', es: 'Integraciones' },
  settings: { pt: 'Configurações', en: 'Settings', es: 'Configuración' },
  profile: { pt: 'Perfil', en: 'Profile', es: 'Perfil' },
  logout: { pt: 'Sair', en: 'Logout', es: 'Cerrar sessão' },
  home: { pt: 'Início', en: 'Home', es: 'Inicio' },

  // Dashboard
  greetingMorning: { pt: 'Bom dia', en: 'Good morning', es: 'Buenos días' },
  greetingAfternoon: { pt: 'Boa tarde', en: 'Good afternoon', es: 'Buenas tardes' },
  greetingEvening: { pt: 'Boa noite', en: 'Good evening', es: 'Buenas noches' },
  greetingNight: { pt: 'Boa noite', en: 'Good night', es: 'Buenas noches' },
  productivityMap: { pt: 'Seu mapa de produtividade está incrível!', en: 'Your productivity map looks amazing!', es: '¡Tu mapa de productividad se ve increíble!' },
  totalTime: { pt: 'Tempo Total', en: 'Total Time', es: 'Tiempo Total' },
  filterTimeAnalysis: { pt: 'Filtrar análise de tempo', en: 'Filter time analysis', es: 'Filtrar análisis de tiempo' },
  focusedInThis: { pt: 'focados neste', en: 'focused in this', es: 'enfocados en este' },
  previous: { pt: 'Anterior', en: 'Previous', es: 'Anterior' },
  growing: { pt: 'Em crescimento!', en: 'Growing!', es: '¡En crescimento!' },
  belowTarget: { pt: 'Abaixo da meta', en: 'Below target', es: 'Por debajo de la meta' },
  highestDedication: { pt: 'Maior dedicação', en: 'Highest dedication', es: 'Mayor dedicación' },
  invested: { pt: 'investidos', en: 'invested', es: 'invertidos' },
  trend: { pt: 'Tendência', en: 'Trend', es: 'Tendencia' },
  timeByCategory: { pt: 'Tempo por Categoria', en: 'Time by Category', es: 'Tiempo por Categoría' },
  todo: { pt: 'A Fazer', en: 'To Do', es: 'Por Hacer' },
  focus: { pt: 'Em Foco', en: 'In Focus', es: 'En Enfoque' },
  done: { pt: 'Concluído', en: 'Done', es: 'Hecho' },
  addMissionsMessage: { pt: 'Adicione missões para ver sua análise!', en: 'Add missions to see your analysis!', es: '¡Añade misiones para ver tu análisis!' },
  myMissions: { pt: 'Minhas Missões', en: 'My Missions', es: 'Mis Misiones' },
  doneOf: { pt: 'concluídas de', en: 'done of', es: 'hechas de' },
  doneTasks: { pt: 'missões concluídas', en: 'missions completed', es: 'misiones completadas' },
  searchMission: { pt: 'Buscar missão...', en: 'Search mission...', es: 'Buscar misión...' },
  noMissionsFound: { pt: 'Nenhuma missão encontrada', en: 'No missions found', es: 'No se encontraron misiones' },
  startByAddingMission: { pt: 'Comece adicionando uma nova missão à sua jornada!', en: 'Start by adding a new mission to your journey!', es: '¡Comienza añadiendo una nueva misión a tu jornada!' },
  weekAbbreviation: { pt: 'Sem', en: 'Wk', es: 'Sem' },

  // Task Form & List
  addTask: { pt: 'Adicionar Missão', en: 'Add Mission', es: 'Añadir Misión' },
  new: { pt: 'Nova', en: 'New', es: 'Nueva' },
  pending: { pt: 'Pendentes', en: 'Pending', es: 'Pendientes' },
  inFocus: { pt: 'Em Foco', en: 'In Focus', es: 'En Foco' },
  completedBadge: { pt: 'Concluída', en: 'Completed', es: 'Completada' },
  searchPlaceholder: { pt: 'Buscar missões...', en: 'Search missions...', es: 'Buscar misiones...' },
  missionTitle: { pt: 'Título da Missão', en: 'Mission Title', es: 'Título de la Misión' },
  missionTitlePlaceholder: { pt: 'Ex: Dominar o mundo, Estudar React...', en: 'Ex: Rule the world, Study React...', es: 'Ej: Dominar el mundo, Estudiar React...' },
  missionDetails: { pt: 'Detalhes da Missão', en: 'Mission Details', es: 'Detalles de la Misión' },
  missionDetailsPlaceholder: { pt: 'O que exatamente você precisa fazer?', en: 'What exactly do you need to do?', es: '¿Qué exactamente necesitas hacer?' },
  categoryNamePlaceholder: { pt: 'Nome da categoria...', en: 'Category name...', es: 'Nombre de la categoría...' },
  categoryPlaceholder: { pt: 'Selecione uma categoria', en: 'Select a category', es: 'Selecciona una categoría' },
  createNewCategory: { pt: '+ Criar Nova Categoria', en: '+ Create New Category', es: '+ Crear Nueva Categoría' },
  priorityPlaceholder: { pt: 'Selecione a prioridade', en: 'Select priority', es: 'Selecciona la prioridad' },
  startImmediately: { pt: 'Iniciar Imediatamente', en: 'Start Immediately', es: 'Iniciar Inmediatamente' },
  startImmediatelyDesc: { pt: 'Começar o timer assim que adicionar', en: 'Start the timer as soon as added', es: 'Comenzar el temporizador al añadir' },
  addMission: { pt: 'Adicionar Missão', en: 'Add Mission', es: 'Añadir Misión' },
  categoryExists: { pt: 'Esta categoria já existe!', en: 'This category already exists!', es: '¡Esta categoría ya existe!' },
  categoryCreated: { pt: 'Nova categoria criada! 🎨', en: 'New category created! 🎨', es: '¡Nueva categoría creada! 🎨' },
  titleRequired: { pt: 'O título da missão é obrigatório!', en: 'The mission title is required!', es: '¡El título de la misión é obligatorio!' },
  titleTooShort: { pt: 'O título deve ter pelo menos 3 caracteres.', en: 'The title must be at least 3 characters long.', es: 'El título debe tener al menos 3 caracteres.' },
  noTasksFound: { pt: 'Nenhuma tarefa encontrada', en: 'No tasks found', es: 'No se encontraron tareas' },
  startByAddingTask: { pt: 'Comece adicionando uma nova tarefa usando o formulário ao lado.', en: 'Start by adding a new task using the form on the side.', es: 'Comienza añadiendo una nueva tarea usando el formulario al lado.' },
  low: { pt: 'Baixa', en: 'Low', es: 'Baja' },
  medium: { pt: 'Média', en: 'Medium', es: 'Media' },
  high: { pt: 'Alta', en: 'High', es: 'Alta' },

  // Task Details
  notesLinks: { pt: 'Notas & Comentários', en: 'Notes & Comments', es: 'Notas y Comentarios' },
  addNotePlaceholder: { pt: 'Adicione uma nota, link ou observação...', en: 'Add a note, link or observation...', es: 'Añade una nota, enlace u observación...' },
  saveNote: { pt: 'Salvar Nota', en: 'Save Note', es: 'Guardar Nota' },
  noNotes: { pt: 'Nenhuma nota registrada.', en: 'No notes recorded.', es: 'No hay notas registradas.' },
  historyTitle: { pt: 'Histórico de Atividades', en: 'Activity History', es: 'Historial de Actividades' },
  noHistory: { pt: 'Nenhuma atividade registrada ainda.', en: 'No activity recorded yet.', es: 'Aún no hay actividad registrada.' },
  focusSessionsTitle: { pt: 'Sessões de Foco', en: 'Focus Sessions', es: 'Sesiones de Enfoque' },
  noFocusSessions: { pt: 'Nenhuma sessão de foco registrada.', en: 'No focus sessions recorded.', es: 'No hay sesiones de enfoque registradas.' },
  duration: { pt: 'Duração', en: 'Duration', es: 'Duración' },
  closeCenter: { pt: 'Fechar Centro', en: 'Close Center', es: 'Cerrar Centro' },
  noDetails: { pt: 'Nenhum detalhe adicional foi registrado para esta missão.', en: 'No additional details were recorded for this mission.', es: 'No se registraram detalhes adicionais para esta missão.' },
  externalLink: { pt: 'Link Externo', en: 'External Link', es: 'Enlace Externo' },
  file: { pt: 'Arquivo', en: 'File', es: 'Archivo' },
  attachFile: { pt: 'Anexar Arquivo', en: 'Attach File', es: 'Adjuntar Archivo' },
  addLink: { pt: 'Adicionar Link', en: 'Add Link', es: 'Añadir Enlace' },
  startedAt: { pt: 'Iniciada em', en: 'Started at', es: 'Iniciada en' },
  totalTimeInvested: { pt: 'Tempo Total Investido', en: 'Total Time Invested', es: 'Tiempo Total Invertido' },
  pomodoroFocusMode: { pt: 'Modo Foco Pomodoro', en: 'Pomodoro Focus Mode', es: 'Modo Enfoque Pomodoro' },
  effort: { pt: 'Esforço', en: 'Effort', es: 'Esfuerzo' },
  pause: { pt: 'Pausar', en: 'Pause', es: 'Pausar' },
  startAction: { pt: 'Iniciar', en: 'Start', es: 'Iniciar' },
  resetTimer: { pt: 'Reiniciar Timer', en: 'Reset Timer', es: 'Reiniciar Temporizador' },
  clearTimerData: { pt: 'Limpar Dados do Timer', en: 'Clear Timer Data', es: 'Limpiar Dados del Temporizador' },
  checklist: { pt: 'Checklist', en: 'Checklist', es: 'Lista de Control' },
  nextStep: { pt: 'Próximo passo?', en: 'Next step?', es: '¿Próximo paso?' },
  noStepsDefined: { pt: 'Nenhum passo definido.', en: 'No steps defined.', es: 'No hay pasos definidos.' },
  completedOf: { pt: 'Concluídos', en: 'Completed', es: 'Completados' },
  critical: { pt: '🔥 Crítica', en: '🔥 Critical', es: '🔥 Crítica' },
  important: { pt: '⚡ Importante', en: '⚡ Important', es: '⚡ Importante' },
  lightPriority: { pt: '🍃 Leve', en: '🍃 Light', es: '🍃 Leve' },

  // Reports
  analyzeProductivity: { pt: 'Analise sua dedicação e produtividade.', en: 'Analyze your dedication and productivity.', es: 'Analiza tu dedicación y productividad.' },
  dedicatedInPeriod: { pt: 'Dedicados neste período', en: 'Dedicated in this period', es: 'Dedicados en este período' },
  focusSessionsCount: { pt: 'Sessões de Foco', en: 'Focus Sessions', es: 'Sesiones de Enfoque' },
  timesDedicated: { pt: 'Vezes que você se dedicou', en: 'Times you dedicated yourself', es: 'Veces que te dedicaste' },
  topCategory: { pt: 'Top Categoria', en: 'Top Category', es: 'Top Categoría' },
  highestPriority: { pt: 'Sua maior prioridade', en: 'Your highest priority', es: 'Tu mayor prioridad' },
  byCategory: { pt: 'Por Categoria', en: 'By Category', es: 'Por Categoría' },
  focusSessionsLabel: { pt: 'sessões de foco', en: 'focus sessions', es: 'sesiones de enfoque' },
  noDataPeriod: { pt: 'Nenhum dado para este período.', en: 'No data for this period.', es: 'No hay datos para este período.' },
  searchByDemand: { pt: 'Busca por Demanda', en: 'Search by Demand', es: 'Búsqueda por Demanda' },
  filterPlaceholder: { pt: 'Filtrar por nome ou categoria...', en: 'Filter by name or category...', es: 'Filtrar por nombre o categoría...' },
  clickToSeeDetails: { pt: 'Clique em um card para ver o histórico detalhado e anexos.', en: 'Click on a card to see detailed history and attachments.', es: 'Haz clic en una tarjeta para ver el historial detallado y los anexos.' },

  // Calendar & Holidays
  holidayRadar: { pt: 'Radar de Feriados', en: 'Holiday Radar', es: 'Radar de Festivos' },
  holidayRadarDesc: { pt: 'Descubra suas próximas pausas estratégicas! 🏝️', en: 'Discover your next strategic breaks! 🏝️', es: '¡Descubre tus próximos descansos estratégicos! 🏝️' },
  syncingCalendar: { pt: 'Sincronizando...', en: 'Syncing...', es: 'Sincronizando...' },
  missionFailed: { pt: 'Falha na Missão', en: 'Mission Failed', es: 'Misión Fallida' },
  tryAgain: { pt: 'Tentar Novamente 🔄', en: 'Try Again 🔄', es: 'Intentar de Nuevo 🔄' },
  noHolidaysFound: { pt: 'Não conseguimos encontrar feriados para {country} no momento.', en: 'We couldn\'t find holidays for {country} at the moment.', es: 'No pudimos encontrar festivos para {country} en este momento.' },
  connectionError: { pt: 'Erro de conexão. Verifique sua internet para ver os feriados!', en: 'Connection error. Check your internet to see the holidays!', es: 'Error de conexión. ¡Comprueba tu internet para ver los festivos!' },
  unexpectedError: { pt: 'Ocorreu um erro inesperado ao carregar o radar.', en: 'An unexpected error occurred while loading the radar.', es: 'Ocurreu un erro inesperado al cargar el radar.' },
  cleanHorizon: { pt: 'Horizonte Limpo', en: 'Clean Horizon', es: 'Horizonte Limpio' },
  noHolidaysMessage: { pt: 'Nenhum feriado detectado no radar por enquanto. <br className="hidden sm:block"/>Hora de focar 100% nas missões!', en: 'No holidays detected on the radar for now. <br className="hidden sm:block"/>Time to focus 100% on missions!', es: 'No se han detectado festivos en el radar por ahora. <br className="hidden sm:block"/>¡Hora de enfocarse al 100% en las misiones!' },
  masterTip: { pt: 'Dica de Mestre 💡', en: 'Master Tip 💡', es: 'Consejo de Maestro 💡' },
  masterTipDesc: { pt: '"Aproveite os feriados para descansar e recarregar suas energias. Uma mente descansada é o seu maior superpoder para vencer qualquer desafio!"', en: '"Take advantage of holidays to rest and recharge your energy. A rested mind is your greatest superpower to overcome any challenge!"', es: '"Aprovecha los festivos para descansar y recargar tus energías. ¡Una mente descansada é tu mayor superpoder para vencer cualquier desafío!"' },
  national: { pt: 'Nacional 🇧🇷', en: 'National 🇺🇸', es: 'Nacional 🇪🇸' },
  regional: { pt: 'Regional 📍', en: 'Regional 📍', es: 'Regional 📍' },
  backToDashboard: { pt: 'Voltar ao Dashboard', en: 'Back to Dashboard', es: 'Volver al Dashboard' },

  // Notifications
  notifications: { pt: 'Notificações', en: 'Notifications', es: 'Notificaciones' },
  newMessages: { pt: 'Você tem {count} novas mensagens', en: 'You have {count} new messages', es: 'Tienes {count} nuevos mensajes' },
  allCaughtUp: { pt: 'Tudo em dia! ✨', en: 'All caught up! ✨', es: '¡Todo al dia! ✨' },
  clearAll: { pt: 'Limpar tudo', en: 'Clear all', es: 'Limpiar todo' },
  noNotifications: { pt: 'Nenhuma notificação por enquanto.', en: 'No notifications for now.', es: 'No hay notificaciones por ahora.' },
  markAllAsRead: { pt: 'Marcar todas como lidas', en: 'Mark all as read', es: 'Marcar todas como leídas' },

  // Integrations
  connectWorlds: { pt: 'Conectar Mundos', en: 'Connect Worlds', es: 'Conectar Mundos' },
  centralizeMissions: { pt: 'Centralize todas as suas missões conectando suas ferramentas favoritas ao seu Centro de Comando.', en: 'Centralize all your missions by connecting your favorite tools to your Command Center.', es: 'Centraliza todas tus misiones conectando tus herramientas favoritas a tu Centro de Mando.' },
  googleSheets: { pt: 'Google Sheets', en: 'Google Sheets', es: 'Google Sheets' },
  googleSheetsDesc: { pt: 'Sincronize tarefas de suas planilhas.', en: 'Sync tasks from your spreadsheets.', es: 'Sincroniza tareas de tus hojas de cálculo.' },
  trelloDesc: { pt: 'Importe cartões de seus quadros.', en: 'Import cards from your boards.', es: 'Importa tarjetas de tus tableros.' },
  notionDesc: { pt: 'Conecte suas bases de dados.', en: 'Connect your databases.', es: 'Conecta tus bases de datos.' },
  asanaDesc: { pt: 'Gerencie projetos complexos.', en: 'Manage complex projects.', es: 'Gestiona proyectos complejos.' },
  hubspotDesc: { pt: 'Sincronize negócios e tickets.', en: 'Sync deals and tickets.', es: 'Sincroniza negocios y tickets.' },
  slackDesc: { pt: 'Receba notificações de tarefas.', en: 'Receive task notifications.', es: 'Recibe notificaciones de tareas.' },
  jiraDesc: { pt: 'Sincronize seus tickets e sprints.', en: 'Sync your tickets and sprints.', es: 'Sincroniza tus tickets y sprints.' },
  zendeskDesc: { pt: 'Gerencie seus tickets de suporte.', en: 'Manage your support tickets.', es: 'Gestiona tus tickets de soporte.' },
  googleKeepDesc: { pt: 'Sincronize suas notas e lembretes.', en: 'Sync your notes and reminders.', es: 'Sincroniza tus notas y recordatorios.' },
  connectedSuccess: { pt: 'Conectado com sucesso ao {provider}!', en: 'Successfully connected to {provider}!', es: '¡Conectado con éxito a {provider}!' },
  authError: { pt: 'Erro na autenticação. Tente novamente.', en: 'Authentication error. Try again.', es: 'Error de autenticación. Intente de nuevo.' },
  syncSuccess: { pt: 'Sincronização concluída com sucesso!', en: 'Sync completed successfully!', es: '¡Sincronización completada con éxito!' },
  syncError: { pt: 'Erro ao sincronizar dados.', en: 'Error syncing data.', es: 'Error al sincronizar datos.' },
  connect: { pt: 'Conectar', en: 'Connect', es: 'Conectar' },
  settingsSaved: { pt: 'Configurações de {name} salvas!', en: '{name} settings saved!', es: '¡Ajustes de {name} guardados!' },
  integrationConfigured: { pt: 'Integração Configurada', en: 'Integration Configured', es: 'Integración Configurada' },
  integrationConfiguredMsg: { pt: 'Você configurou com sucesso a integração com {name}.', en: 'You have successfully configured the integration with {name}.', es: 'Has configurado con éxito la integración con {name}.' },
  syncNow: { pt: 'Sincronizar Agora', en: 'Sync Now', es: 'Sincronizar Ahora' },
  syncing: { pt: 'Sincronizando...', en: 'Syncing...', es: 'Sincronizando...' },
  securityNotice: { pt: 'Suas chaves de API são armazenadas localmente no seu navegador para sua segurança. Nunca as compartilhe com ninguém.', en: 'Your API keys are stored locally in your browser for your security. Never share them with anyone.', es: 'Tus claves de API se almacenan localmente en tu navegador para tu seguridad. Nunca las compartas con nadie.' },

  // Settings & Profile
  heroPlan: { pt: 'Plano Herói', en: 'Hero Plan', es: 'Plan Héroe' },
  activeMember: { pt: 'Membro Ativo', en: 'Active Member', es: 'Miembro Ativo' },
  secretIdentity: { pt: 'Identidade Secreta', en: 'Secret Identity', es: 'Identidad Secreta' },
  fullName: { pt: 'Nome Completo', en: 'Full Name', es: 'Nombre Completo' },
  anonymousHero: { pt: 'Herói Anônimo', en: 'Anonymous Hero', es: 'Héroe Anónimo' },
  email: { pt: 'E-mail', en: 'E-mail', es: 'Correo electrónico' },
  notLinked: { pt: 'Não vinculado', en: 'Not linked', es: 'No vinculado' },
  securityLevel: { pt: 'Nível de Segurança', en: 'Security Level', es: 'Nivel de Seguridad' },
  securityEnabled: { pt: 'Ativada (2FA)', en: 'Enabled (2FA)', es: 'Activada (2FA)' },
  securityDisabled: { pt: 'Básica (Senha)', en: 'Basic (Password)', es: 'Básica (Contraseña)' },
  birthDate: { pt: 'Data de Nascimento', en: 'Birth Date', es: 'Fecha de Nascimento' },
  dateNotRevealed: { pt: 'Data não revelada', en: 'Date not revealed', es: 'Fecha no revelada' },
  controlPanel: { pt: 'Painel de Controle', en: 'Control Panel', es: 'Panel de Control' },
  manageAlerts: { pt: 'Gerenciar alertas e sons', en: 'Manage alerts and sounds', es: 'Gestionar alertas y sonidos' },
  billing: { pt: 'Faturamento', en: 'Billing', es: 'Facturación' },
  plansPayments: { pt: 'Planos e pagamentos', en: 'Plans and payments', es: 'Planes y pagos' },
  langTheme: { pt: 'Idioma e tema visual', en: 'Language and visual theme', es: 'Idioma y tema visual' },
  language: { pt: 'Idioma', en: 'Language', es: 'Idioma' },
  displayMode: { pt: 'Modo de Exibição', en: 'Display Mode', es: 'Modo de Visualización' },
  light: { pt: 'Claro', en: 'Light', es: 'Claro' },
  dark: { pt: 'Escuro', en: 'Dark', es: 'Oscuro' },
  colorPalette: { pt: 'Paleta de Cores', en: 'Color Palette', es: 'Paleta de Colores' },
  autoColors: { pt: 'As cores se adaptam ao seu estilo de foco!', en: 'Colors adapt to your focus style!', es: '¡Los colores se adaptan a tu estilo de enfoque!' },
  developedBy: { pt: 'Desenvolvido com ❤️ por TaskFlow Team', en: 'Developed with ❤️ by TaskFlow Team', es: 'Desarrollado con ❤️ por TaskFlow Team' },
  portuguese: { pt: 'Português', en: 'Portuguese', es: 'Portugués' },
  english: { pt: 'Inglês', en: 'English', es: 'Inglés' },
  spanish: { pt: 'Espanhol', en: 'Spanish', es: 'Español' },

  // Toasts & Action Logs
  logoutSuccessToast: { pt: 'Você saiu da sua jornada com segurança! 👋', en: 'You left your journey safely! 👋', es: '¡Saliste de tu jornada con seguridad! 👋' },
  sessionExpired: { pt: 'Sessão expirada. Por favor, faça login novamente.', en: 'Session expired. Please log in again.', es: 'Sesión expirada. Por favor, inicie sesión de nuevo.' },
  missionAddedToast: { pt: 'Missão adicionada à sua jornada! 🚀', en: 'Mission added to your journey! 🚀', es: '¡Misión añadida a tu jornada! 🚀' },
  missionRemovedToast: { pt: 'Missão removida com sucesso! 🗑️', en: 'Mission removed successfully! 🗑️', es: '¡Misión eliminada con éxito! 🗑️' },
  missionCompletedAction: { pt: 'Missão concluída', en: 'Mission completed', es: 'Misión completada' },
  missionReopenedAction: { pt: 'Missão reaberta', en: 'Mission reopened', es: 'Misión reabierta' },
  missionFocusedAction: { pt: 'Entrou em foco', en: 'Entered focus', es: 'Entró en enfoque' },
  focusStartedToast: { pt: 'Foco iniciado! O timer está rodando. ⚡', en: 'Focus started! The timer is running. ⚡', es: '¡Enfoque iniciado! El temporizador está funcionando. ⚡' },
  pomodoroFinishedToast: { pt: 'Pomodoro concluído: {task} ⏰', en: 'Pomodoro finished: {task} ⏰', es: 'Pomodoro terminado: {task} ⏰' },
  timerFinishedTitle: { pt: 'Timer Concluído! ⏰', en: 'Timer Finished! ⏰', es: '¡Temporizador Terminado! ⏰' },
  timerFinishedMessage: { pt: 'O tempo de foco para "{task}" chegou ao fim. Faça uma pausa!', en: 'The focus time for "{task}" has come to an end. Take a break!', es: 'El tiempo de enfoque para "{task}" ha terminado. ¡Tómate un descanso!' },
  syncSuccessToast: { pt: '{count} tarefas sincronizadas com sucesso! 🔄', en: '{count} tasks synced successfully! 🔄', es: '¡{count} tareas sincronizadas con éxito! 🔄' },
  syncFailed: { pt: 'Falha na sincronização ❌', en: 'Sync failed ❌', es: 'Fallo en la sincronización ❌' },
  syncConnectionError: { pt: 'Não foi possível conectar com as integrações externas.', en: 'Could not connect to external integrations.', es: 'No se conectar con las integraciones externas.' },
  syncFinishedTitle: { pt: 'Sincronização Concluída! 🔄', en: 'Sync Finished! 🔄', es: '¡Sincronización Terminada! 🔄' },
  syncFinishedMessage: { pt: '{count} tarefas foram atualizadas das suas integrações externas.', en: '{count} tasks were updated from your external integrations.', es: '{count} tareas fueron actualizadas desde sus integraciones externas.' },
  newMissionTitle: { pt: 'Nova Missão em {source}! 🚀', en: 'New Mission in {source}! 🚀', es: '¡Nueva Misión en {source}! 🚀' },
  newMissionMessage: { pt: 'Uma nova missão "{task}" foi importada.', en: 'A new mission "{task}" was imported.', es: 'Se ha importado una nueva misión "{task}".' },
  newCommentTitle: { pt: 'Novo Comentário em {source}! 💬', en: 'New Comment in {source}! 💬', es: '¡Novo Comentario em {source}! 💬' },
  newCommentMessage: { pt: '"{author}" comentou na missão "{task}".', en: '"{author}" commented on the mission "{task}".', es: '"{author}" comentó en la misión "{task}".' },
  missionCreatedAction: { pt: 'Missão criada', en: 'Mission created', es: 'Misión creada' },
  imageAttachedToast: { pt: 'Imagem "{name}" anexada! 📸', en: 'Image "{name}" attached! 📸', es: '¡Imagen "{name}" adjunta! 📸' },
  fileAttachedToast: { pt: 'Arquivo "{name}" anexada! 📎', en: 'File "{name}" attached! 📎', es: '¡Arquivo "{name}" adjunto! 📎' },
  syncNoteToast: { pt: 'Nota sincronizada com {source}! 🔄', en: 'Note synced with {source}! 🔄', es: '¡Nota sincronizada con {source}! 🔄' },
  syncNoteDesc: { pt: 'Seu comentário foi refletido no board de origem.', en: 'Your comment was reflected on the source board.', es: 'Tu comentario se reflejó en el tablero de origen.' },
  fileAttachedToMissionToast: { pt: 'Arquivo "{name}" adicionado à missão! 📎', en: 'File "{name}" added to mission! 📎', es: '¡Archivo "{name}" añadido a la misión! 📎' },
  linkAddedToMissionToast: { pt: 'Link adicionado à missão! 🔗', en: 'Link added to mission! 🔗', es: '¡Enlace añadido a la misión! 🔗' },
  subtaskAdded: { pt: 'Sub-tarefa adicionada', en: 'Sub-task added', es: 'Subtarea añadida' },
  subtaskReopened: { pt: 'Sub-tarefa reaberta', en: 'Sub-task reopened', es: 'Subtarea reabierta' },
  subtaskCompleted: { pt: 'Sub-tarefa concluída', en: 'Sub-task completed', es: 'Subtarea completada' },
  subtaskRemoved: { pt: 'Sub-tarefa removida', en: 'Sub-task removed', es: 'Subtarea eliminada' },
  commentAdded: { pt: 'Comentário adicionado', en: 'Comment added', es: 'Comentario añadido' },
  attachmentAdded: { pt: 'Anexo adicionado à missão', en: 'Attachment added to mission', es: 'Anexo añadido a la misión' },
  linkAddedToMission: { pt: 'Link adicionado à missão', en: 'Link added to mission', es: 'Enlace añadido a la misión' },
  attachmentRemoved: { pt: 'Anexo removido da missão', en: 'Attachment removed from mission', es: 'Anexo eliminado de la misión' },
  timerStarted: { pt: 'Timer iniciado', en: 'Timer started', es: 'Temporizador iniciado' },
  timerPaused: { pt: 'Timer pausado', en: 'Timer paused', es: 'Temporizador pausado' },

  // Categories (Default)
  trabalho: { pt: 'Trabalho', en: 'Work', es: 'Trabajo' },
  estudos: { pt: 'Estudos', en: 'Studies', es: 'Estudios' },
  pessoal: { pt: 'Pessoal', en: 'Personal', es: 'Personal' },
  saude: { pt: 'Saúde', en: 'Health', es: 'Salud' },
  outros: { pt: 'Outros', en: 'Others', es: 'Otros' },
  work: { pt: 'Trabalho', en: 'Work', es: 'Trabajo' },
  studies: { pt: 'Estudos', en: 'Studies', es: 'Estudios' },
  personal: { pt: 'Pessoal', en: 'Personal', es: 'Personal' },
  health: { pt: 'Saúde', en: 'Health', es: 'Salud' },
  others: { pt: 'Outros', en: 'Others', es: 'Otros' },

  // Holiday Names (2026 BR)
  h_anoNovo: { pt: 'Ano Novo', en: 'New Year', es: 'Año Nuevo' },
  h_carnaval: { pt: 'Carnaval', en: 'Carnival', es: 'Carnaval' },
  h_sextaSanta: { pt: 'Sexta-feira Santa', en: 'Good Friday', es: 'Viernes Santo' },
  h_pascoa: { pt: 'Páscoa', en: 'Easter', es: 'Pascua' },
  h_tiradentes: { pt: 'Tiradentes', en: 'Tiradentes', es: 'Tiradentes' },
  h_diaTrabalho: { pt: 'Dia do Trabalho', en: 'Labor Day', es: 'Día del Trabajo' },
  h_corpusChristi: { pt: 'Corpus Christi', en: 'Corpus Christi', es: 'Corpus Christi' },
  h_independencia: { pt: 'Independência do Brasil', en: 'Independence Day', es: 'Día de la Independencia' },
  h_nossaSenhora: { pt: 'Nossa Senhora Aparecida', en: 'Our Lady of Aparecida', es: 'Nuestra Señora Aparecida' },
  h_finados: { pt: 'Finados', en: 'All Souls\' Day', es: 'Día de los Difuntos' },
  h_proclamacao: { pt: 'Proclamação da República', en: 'Proclamation of the Republic', es: 'Proclamación de la República' },
  h_natal: { pt: 'Natal', en: 'Christmas', es: 'Navidad' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    let text = translations[key][language];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
