import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    ConfigProvider,
    DatePicker,
    Descriptions,
    Drawer,
    Dropdown,
    Empty,
    Form,
    Input,
    InputNumber,
    Layout,
    LocaleProvider,
    Menu,
    message,
    Modal,
    Popconfirm,
    Popover,
    Row,
    Spin,
    Switch,
    Tabs,
    Tag,
    Tooltip,
    TreeSelect,
    Table,
    Select,
    Divider,
    Space
} from 'ant-design-vue';
export const antdv = (app) => {
    app.config.globalProperties.$confirm = Modal.confirm;
    app.config.globalProperties.$message = message;

    return app
        .use(ConfigProvider)
        .use(Layout)
        .use(Menu)
        .use(Form)
        .use(Input)
        .use(Button)
        .use(Popover)
        .use(Dropdown)
        .use(Drawer)
        .use(Empty)
        .use(TreeSelect)
        .use(Switch)
        .use(Tooltip)
        .use(Popconfirm)
        .use(Avatar)
        .use(InputNumber)
        .use(Tabs)
        .use(Badge)
        .use(Tag)
        .use(Spin)
        .use(DatePicker)
        .use(Descriptions)
        .use(LocaleProvider)
        .use(Card)
        .use(Row)
        .use(Col)
        .use(Modal)
        .use(Select)
        .use(Space)
        .use(Divider)
        .use(Table);
};
