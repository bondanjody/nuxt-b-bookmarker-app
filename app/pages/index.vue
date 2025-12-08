<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <UCard class="w-full max-w-sm">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold">Welcome ! 👋</h1>
        <p class="text-gray-500 dark:text-gray-400">
          Please fill your account detail.
        </p>
      </div>

      <UForm :state="state" class="space-y-4" @submit.prevent="handleLogin">
        <UFormGroup label="Email" name="email" required :error="errors.email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="anda@contoh.com"
            icon="i-heroicons-envelope"
            @change="errors.email = ''"
          />
        </UFormGroup>

        <UFormGroup
          label="Password"
          name="password"
          required
          :error="errors.password"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            @change="errors.password = ''"
          />
        </UFormGroup>

        <UButton type="submit" block :loading="loading"> Login </UButton>
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Do not have an acoount yet ?
          <ULink href="#" class="font-medium text-primary hover:underline">
            Sign up here
          </ULink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// 1. Definisikan Tipe State
interface LoginState {
  email: string;
  password: string;
  rememberMe: boolean;
}

// 2. Definisikan State (Data Form)
const state = reactive<LoginState>({
  email: "",
  password: "",
  rememberMe: false,
});

// 3. State untuk Error Manual
const errors = reactive({
  email: "",
  password: "",
});

const loading = ref(false);
const toast = useToast();

// 4. Fungsi Validasi Manual
function validate(): boolean {
  let isValid = true;
  errors.email = "";
  errors.password = "";

  // Validasi Email
  if (!state.email) {
    errors.email = "Email wajib diisi.";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(state.email)) {
    errors.email = "Format email tidak valid.";
    isValid = false;
  }

  // Validasi Password
  if (!state.password) {
    errors.password = "Password wajib diisi.";
    isValid = false;
  } else if (state.password.length < 6) {
    errors.password = "Password minimal 6 karakter.";
    isValid = false;
  }

  return isValid;
}

// 5. Fungsi Login Utama
async function handleLogin() {
  // 5a. Lakukan Validasi
  if (!validate()) {
    // Jika validasi gagal, hentikan proses
    toast.add({
      title: "Validasi Gagal",
      description: "Mohon periksa kembali input Anda.",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
    return;
  }

  // 5b. Jika Validasi Berhasil, Lanjutkan Proses Login
  loading.value = true;
  console.log("Data Formulir:", state);

  // Simulasi proses login (memanggil API)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Tampilkan notifikasi sukses
  toast.add({
    title: "Login Berhasil!",
    description: `Selamat datang kembali, ${state.email}.`,
    icon: "i-heroicons-check-circle",
    color: "green",
  });

  loading.value = false;
  // Contoh: Redirect ke halaman dashboard
  // await navigateTo('/dashboard');
}

// 6. Setup Metadata Halaman
definePageMeta({
  layout: false,
});
</script>
